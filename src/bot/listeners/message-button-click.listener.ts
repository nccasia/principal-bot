/* eslint-disable @typescript-eslint/no-base-to-string */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { MezonClient } from 'mezon-sdk';
import { MezonClientService } from 'src/mezon/services/client.service';
import {
  EmbedProps,
  MEZON_EMBED_FOOTER,
} from 'src/bot/commands/asterisk/config/config';
import { COLORS } from 'src/bot/utils/helper';
import { plainToClass } from 'class-transformer';
import { CvFormDto } from '../dtos/cv-form.dto';
import { validate } from 'class-validator';
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

  async serverSendMessage(channelId, messageEmbedProps: EmbedProps[]) {
    try {
      const channel = await this.client.channels.fetch(channelId);
      await channel.send({
        embed: messageEmbedProps,
      });
    } catch (error) {
      this.logger.error('Lỗi trong serverSendMessage:', error);
    }
  }

  async serverEditMessage(data, embedProps: EmbedProps[]) {
    try {
      const channel = await this.client.channels.fetch(data.channel_id);
      const message = await channel.messages.fetch(data.message_id);

      await message.update({
        embed: embedProps,
        components: [], // Xóa các nút sau khi xử lý form
      });

      this.logger.log('Form đã được cập nhật thành công');
    } catch (error) {
      this.logger.error('Lỗi khi cập nhật tin nhắn:', error);
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
      this.logger.log('Giá trị form đã parse:', formValues);

      // Validate dữ liệu
      const cvForm = plainToClass(CvFormDto, formValues);
      this.logger.log('Dữ liệu form sau khi parse:', cvForm);
      const errors = await validate(cvForm);
      this.logger.log('Kết quả validate:', errors);

      if (errors.length > 0) {
        // Tạo thông báo lỗi từ các lỗi validation
        const errorMessages = errors.map((err) =>
          Object.values(err.constraints || {}).join(', '),
        );

        const validationErrorEmbed: EmbedProps[] = [
          {
            color: COLORS.Red,
            title: '❌ Lỗi gửi CV',
            description: 'Vui lòng kiểm tra lại thông tin nhập vào:',
            fields: [{ name: 'Lỗi', value: errorMessages.join(' - ') }],
          },
        ];

        await this.serverEditMessage(data, validationErrorEmbed);
        return;
      }

      // Embed
      const confirmEmbed: EmbedProps[] = [
        {
          color: COLORS.Green,
          title: '✅ Gửi CV thành công!',
          description:
            'Cảm ơn bạn đã gửi CV. Chúng tôi sẽ liên hệ với bạn sớm nhất có thể.',
          fields: [
            {
              name: 'Thông tin cá nhân',
              value: `Họ tên: ${formValues['fullname']}  -  Email: ${formValues['email']}  -  Số điện thoại: ${formValues['phone']}`,
            },
            {
              name: 'Thông tin vị trí ứng tuyển',
              value: `Vị trí: ${formValues['position']}  -  Chi nhánh: ${formValues['branch']}  -  Loại ứng viên: ${formValues['candidate-type']}`,
            },
            ...(formValues['gender'] ||
            formValues['dob'] ||
            formValues['address']
              ? [
                  {
                    name: 'Thông tin bổ sung',
                    value: `${formValues['gender'] ? `Giới tính: ${formValues['gender']}  ` : ''}${
                      formValues['dob']
                        ? `-  Ngày sinh: ${formValues['dob']}\n`
                        : ''
                    }${formValues['address'] ? `-  Địa chỉ: ${formValues['address']}` : ''}`,
                  },
                ]
              : []),
            ...(formValues['note']
              ? [
                  {
                    name: 'Ghi chú',
                    value: formValues['note'],
                  },
                ]
              : []),
            {
              name: 'Nguồn CV',
              value: formValues['cv-source'],
            },
          ],
          thumbnail: {
            url: 'https://cdn.mezon.ai/1840673714920755200/1840673714937532416/1831911016607256600/1745203716783_undefinedbeautiful_green_tree_field_ireland_600nw_2493424341.webp',
          },
          timestamp: new Date().toISOString(),
          footer: MEZON_EMBED_FOOTER,
        },
      ];

      try {
        await this.serverEditMessage(data, confirmEmbed);
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

      const cancelEmbed: EmbedProps[] = [
        {
          color: COLORS.Red,
          title: '❌ Hủy gửi CV',
          description: 'Bạn đã hủy gửi CV.',
        },
      ];

      // Gửi thông báo hủy
      try {
        await this.serverEditMessage(data, cancelEmbed);
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
