/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Events, MezonClient } from 'mezon-sdk';
import { MezonClientService } from 'src/mezon/services/client.service';

@Injectable()
export class MessageButtonClickListener {
  protected client: MezonClient;
  // Lưu trữ sự kiện đã xử lý
  protected readonly processedEvents = new Map<string, number>();
  // Lưu trữ form submissions đã xử lý để ngăn gửi tin nhắn trùng lặp
  private static processedSubmissions = new Map<string, number>();

  constructor(
    clientService: MezonClientService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.client = clientService.getClient();
  }
  private readonly logger = new Logger(MessageButtonClickListener.name);

  @OnEvent('message_button_clicked')
  async handleButtonForm(data) {
    try {
      // Tạo ID duy nhất từ thông tin sự kiện
      const eventId = `${data.message_id}_${data.button_id}_${data.user_id}`;
      const now = Date.now();

      // Kiểm tra xem sự kiện này đã được xử lý gần đây chưa
      if (this.processedEvents.has(eventId)) {
        const lastProcessed = this.processedEvents.get(eventId);
        // Nếu sự kiện đã được xử lý trong vòng 2 giây trước đó
        if (now - lastProcessed < 2000) {
          this.logger.log(`Đã bỏ qua sự kiện trùng lặp: ${eventId}`);
          return; // Bỏ qua xử lý
        }
      }

      // Ghi nhận sự kiện này đã được xử lý
      this.processedEvents.set(eventId, now);

      // Dọn dẹp bộ nhớ đệm theo định kỳ
      if (this.processedEvents.size > 100) {
        const fiveMinutesAgo = now - 300000;
        for (const [key, timestamp] of this.processedEvents.entries()) {
          if (timestamp < fiveMinutesAgo) {
            this.processedEvents.delete(key);
          }
        }
      }

      this.logger.log('Xử lý sự kiện button click:', data.button_id);

      // Xử lý button ID
      const splitButtonId = data.button_id.split('_');
      if (splitButtonId.length !== 3) {
        this.logger.warn('Định dạng button ID không hợp lệ:', data.button_id);
        return;
      }

      const formType = splitButtonId[0]; // CV
      const messageId = splitButtonId[1]; // ID tin nhắn
      const action = splitButtonId[2]; // submit hoặc cancel

      // Xử lý form CV
      if (formType === 'CV') {
        if (action === 'submit') {
          await this.handleSubmitCV(data, messageId);
        } else if (action === 'cancel') {
          await this.handleCancelCV(data, messageId);
        }
      }
    } catch (error) {
      this.logger.error('Lỗi xử lý sự kiện click button:', error);
    }
  }

  async handleSubmitCV(data, messageId) {
    try {
      // Tạo ID duy nhất cho form submission này
      const formSubmissionId = `form_${messageId}_${data.user_id}`;

      // Kiểm tra nếu form này đã được xử lý trước đó
      if (
        MessageButtonClickListener.processedSubmissions.has(formSubmissionId)
      ) {
        this.logger.log(`Form đã được xử lý trước đó: ${formSubmissionId}`);
        return;
      }

      // Đánh dấu form này đã được xử lý TRƯỚC khi thực hiện các thao tác async
      MessageButtonClickListener.processedSubmissions.set(
        formSubmissionId,
        Date.now(),
      );

      // Tự động dọn dẹp các form đã xử lý sau 5 phút
      setTimeout(() => {
        MessageButtonClickListener.processedSubmissions.delete(
          formSubmissionId,
        );
      }, 300000);

      // Parse data từ form
      const extraData = JSON.parse(data.extra_data);
      const formValues = {};
      const fieldKeys = [
        'fullname',
        'email',
        'phone',
        'candidate-type',
        'position',
        'branch',
        'cv-source',
        'dob',
        'gender',
        'address',
        'note',
      ];

      // Extract values từ extraData đã parse
      for (const key of fieldKeys) {
        const fieldKey = `applycv-${messageId}-${key}`;
        formValues[key] = Array.isArray(extraData[fieldKey])
          ? extraData[fieldKey][0] // Lấy giá trị đầu tiên nếu là mảng
          : extraData[fieldKey]; // Sử dụng nguyên giá trị nếu không phải mảng
      }

      // Tạo nội dung tin nhắn xác nhận
      const sentCvContent =
        '```' +
        'Bạn đã nộp CV thành công !' +
        '\n\n' +
        `Họ tên: ${formValues['fullname']}` +
        '\n' +
        `Email: ${formValues['email']}` +
        '\n' +
        `Số điện thoại: ${formValues['phone']}` +
        '\n' +
        `Loại ứng viên: ${formValues['candidate-type']}` +
        '\n' +
        `Vị trí: ${formValues['position']}` +
        '\n' +
        `Chi nhánh: ${formValues['branch']}` +
        '\n' +
        `Nguồn CV: ${formValues['cv-source']}` +
        '\n' +
        (formValues['dob'] ? `Ngày sinh: ${formValues['dob']}\n` : '') +
        (formValues['gender'] ? `Giới tính: ${formValues['gender']}\n` : '') +
        (formValues['address'] ? `Địa chỉ: ${formValues['address']}\n` : '') +
        (formValues['note'] ? `Ghi chú: ${formValues['note']}\n` : '') +
        '\n' +
        'Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất.' +
        '```';

      try {
        // Gửi tin nhắn xác nhận - đã sửa cách xử lý Promise
        const channel = await this.client.channels.fetch(data.channel_id);
        await channel.send({
          t: sentCvContent,
        });
        this.logger.log('Đã gửi xác nhận nộp CV thành công');
        this.logger.log('Thông tin form:', formValues);
      } catch (sendError) {
        this.logger.error('Lỗi khi gửi tin nhắn xác nhận CV:', sendError);
        // Xóa khỏi danh sách đã xử lý nếu gặp lỗi để có thể thử lại sau
        MessageButtonClickListener.processedSubmissions.delete(
          formSubmissionId,
        );
      }
    } catch (error) {
      this.logger.error('Lỗi trong handleSubmitCV:', error);
    }
  }

  async handleCancelCV(data, messageId) {
    try {
      // Tạo ID duy nhất cho cancel action này
      const cancelActionId = `cancel_${messageId}_${data.user_id}`;

      // Kiểm tra nếu action này đã được xử lý
      if (MessageButtonClickListener.processedSubmissions.has(cancelActionId)) {
        this.logger.log(`Cancel action đã được xử lý: ${cancelActionId}`);
        return;
      }

      // Đánh dấu đã xử lý
      MessageButtonClickListener.processedSubmissions.set(
        cancelActionId,
        Date.now(),
      );

      // Gửi thông báo hủy
      try {
        const channel = await this.client.channels.fetch(data.channel_id);
        await channel.send({
          t: 'Bạn đã hủy gửi CV, vui lòng thử lại sau.',
        });
        this.logger.log('Đã gửi thông báo hủy form CV');
      } catch (sendError) {
        this.logger.error('Lỗi khi gửi thông báo hủy CV:', sendError);
        MessageButtonClickListener.processedSubmissions.delete(cancelActionId);
      }
    } catch (error) {
      this.logger.error('Lỗi trong handleCancelCV:', error);
    }
  }
}
