# Principal Bot

## Introduction

Principal Bot is a server-side application built with NestJS. It integrates with the Mezon platform to provide interactive form submissions. Users can send a message starting with `*guicv` and attach a file (e.g., a CV in PDF or DOCX format). If the attachment is valid, the bot responds with an interactive form. The user can then fill out this form, and upon submission, the data is sent back to the server for processing.

The bot handles form expiration, caching of user data and attachments, and communication with a Talent API.

### Giới thiệu (Introduction - Vietnamese)

Principal Bot là một ứng dụng phía máy chủ được xây dựng bằng NestJS. Nó tích hợp với nền tảng Mezon để cung cấp tính năng gửi biểu mẫu tương tác. Người dùng có thể gửi tin nhắn bắt đầu bằng `*guicv` và đính kèm một tệp (ví dụ: CV ở định dạng PDF hoặc DOCX). Nếu tệp đính kèm hợp lệ, bot sẽ phản hồi bằng một biểu mẫu tương tác. Sau đó, người dùng có thể điền vào biểu mẫu này và khi gửi, dữ liệu sẽ được chuyển lại cho máy chủ để xử lý.

Bot xử lý việc hết hạn biểu mẫu, lưu trữ tạm dữ liệu người dùng và tệp đính kèm, cũng như giao tiếp với một Talent API.

## Features

- **CV Submission Trigger**: Initiates a form when a user sends `*guicv` with a valid file attachment.
- **Interactive Forms**: Displays a dynamic form for users to input their application details.
- **Data Caching**: Temporarily caches CV attachments, user avatars, and form response message IDs using Redis.
- **Form Expiration**: Forms automatically expire after a set duration (e.g., 5 minutes), updating the original message to indicate expiry.
- **Database Integration**: Stores form submission data in a PostgreSQL database.
- **API Integration**: Communicates with an external Talent API.

### Tính năng (Features - Vietnamese)

- **Kích hoạt gửi CV**: Khởi tạo một biểu mẫu khi người dùng gửi `*guicv` kèm theo một tệp đính kèm hợp lệ.
- **Biểu mẫu tương tác**: Hiển thị một biểu mẫu động để người dùng nhập thông tin ứng tuyển của họ.
- **Lưu trữ dữ liệu tạm thời (Caching)**: Lưu trữ tạm thời các tệp CV đính kèm, ảnh đại diện của người dùng và ID tin nhắn phản hồi biểu mẫu bằng Redis.
- **Hết hạn biểu mẫu**: Biểu mẫu tự động hết hạn sau một khoảng thời gian nhất định (ví dụ: 5 phút), cập nhật tin nhắn gốc để thông báo hết hạn.
- **Tích hợp cơ sở dữ liệu**: Lưu trữ dữ liệu gửi từ biểu mẫu trong cơ sở dữ liệu PostgreSQL.
- **Tích hợp API**: Giao tiếp với một Talent API bên ngoài.

## Tech Stack

- [NestJS](https://nestjs.com/) (Node.js framework)
- TypeScript
- Mezon SDK
- PostgreSQL (Database)
- Redis (Caching)
- TypeORM
- Docker (recommended for running services)

### Công nghệ sử dụng (Tech Stack - Vietnamese)

- [NestJS](https://nestjs.com/) (Framework Node.js)
- TypeScript
- Mezon SDK
- PostgreSQL (Cơ sở dữ liệu)
- Redis (Caching)
- TypeORM
- Docker (khuyến nghị để chạy các dịch vụ)

## Prerequisites

- Node.js (Version >=20.0.0 recommended, as per `package.json`)
- npm (Version >=10.0.0 recommended, as per `package.json`)
- Docker and Docker Compose (Recommended for running PostgreSQL and Redis)
- Access to a Mezon Bot token and relevant channel IDs.

### Yêu cầu cài đặt (Prerequisites - Vietnamese)

- Node.js (Khuyến nghị phiên bản >=20.0.0, theo `package.json`)
- npm (Khuyến nghị phiên bản >=10.0.0, theo `package.json`)
- Docker và Docker Compose (Khuyến nghị để chạy PostgreSQL và Redis)
- Quyền truy cập vào Mezon Bot token và các ID kênh liên quan.

## Getting Started

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd principal-bot
```

### Bắt đầu (Getting Started - Vietnamese)

#### 1. Sao chép Repository (Clone the Repository)

```bash
git clone <your-repository-url>
cd principal-bot
```

### 2. Environment Configuration

Create a `.env` file in the root of the project. This file will store your environment-specific configurations.

**It is highly recommended to create an `.env.example` file in your repository detailing all required variables.**

You will need to set the following environment variables. Obtain the Mezon-specific tokens and IDs from your Mezon platform setup.

```env
# Application Configuration
NODE_ENV=development

# PostgreSQL Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=your_postgres_user
DATABASE_PASSWORD=your_postgres_password
DATABASE_NAME=principal_bot_db

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
# REDIS_PASSWORD= (if you have one)
# REDIS_DB=0 (if you use a specific DB index)

# Mezon Bot Configuration
MEZON_TOKEN=your_mezon_bot_token
CHANNEL_MAIN_ID=your_mezon_main_channel_id
CHANNEL_TEST_ID=your_mezon_test_channel_id
SIGNATURE=your_mezon_bot_signature
BOT_ID=your_mezon_bot_id
BOT_USERNAME=your_mezon_bot_username

# Talent API (Example)
TALENT_API_URL=your_talent_api_endpoint
```

**Note**: Replace placeholder values with your actual configuration details.

### 2. Cấu hình môi trường (Environment Configuration - Vietnamese)

Tạo một tệp `.env` trong thư mục gốc của dự án. Tệp này sẽ lưu trữ các cấu hình cụ thể cho môi trường của bạn.

**Rất khuyến khích tạo một tệp `.env.example` trong repository của bạn, liệt kê chi tiết tất cả các biến cần thiết.**

Bạn sẽ cần thiết lập các biến môi trường sau. Lấy các token và ID cụ thể của Mezon từ thiết lập nền tảng Mezon của bạn.

```env
# Cấu hình ứng dụng
NODE_ENV=development

# Cấu hình cơ sở dữ liệu PostgreSQL
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=your_postgres_user
DATABASE_PASSWORD=your_postgres_password
DATABASE_NAME=principal_bot_db

# Cấu hình Redis
REDIS_HOST=localhost
REDIS_PORT=6379
# REDIS_PASSWORD= (nếu có)
# REDIS_DB=0 (nếu bạn sử dụng một chỉ mục DB cụ thể)

# Cấu hình Mezon Bot
MEZON_TOKEN=your_mezon_bot_token
CHANNEL_MAIN_ID=your_mezon_main_channel_id
CHANNEL_TEST_ID=your_mezon_test_channel_id
SIGNATURE=your_mezon_bot_signature
BOT_ID=your_mezon_bot_id
BOT_USERNAME=your_mezon_bot_username

# Talent API (Ví dụ)
TALENT_API_URL=your_talent_api_endpoint
```

**Lưu ý**: Thay thế các giá trị giữ chỗ bằng chi tiết cấu hình thực tế của bạn.

### 3. Setup PostgreSQL and Redis

**Using Docker (Recommended):**

If you have a `docker-compose.yml` file in your project configured for PostgreSQL and Redis, you can start these services by running:

```bash
docker-compose up -d
```

_(If you provide the `docker-compose.yml`, I can include its content or more specific instructions here.)_

**Manual Setup:**

If you are not using Docker, ensure you have PostgreSQL and Redis instances running and accessible to the application with the credentials specified in your `.env` file.

- **PostgreSQL**: Install PostgreSQL locally or use a cloud-hosted instance. Create the database specified in `DATABASE_NAME`.
- **Redis**: Install Redis locally or use a cloud-hosted instance.

### 3. Thiết lập PostgreSQL và Redis (Setup PostgreSQL and Redis - Vietnamese)

**Sử dụng Docker (Khuyến nghị):**

Nếu bạn có tệp `docker-compose.yml` trong dự án được cấu hình cho PostgreSQL và Redis, bạn có thể khởi động các dịch vụ này bằng cách chạy:

```bash
docker-compose up -d
```

_(Nếu bạn cung cấp tệp `docker-compose.yml`, tôi có thể bao gồm nội dung của nó hoặc hướng dẫn cụ thể hơn ở đây.)_

**Thiết lập thủ công:**

Nếu bạn không sử dụng Docker, hãy đảm bảo bạn có các instance PostgreSQL và Redis đang chạy và ứng dụng có thể truy cập được với thông tin xác thực được chỉ định trong tệp `.env` của bạn.

- **PostgreSQL**: Cài đặt PostgreSQL cục bộ hoặc sử dụng một instance được lưu trữ trên đám mây. Tạo cơ sở dữ liệu được chỉ định trong `DATABASE_NAME`.
- **Redis**: Cài đặt Redis cục bộ hoặc sử dụng một instance được lưu trữ trên đám mây.

### 4. Install Dependencies

Install the project dependencies using npm:

```bash
npm install
```

### 4. Cài đặt Dependencies (Install Dependencies - Vietnamese)

Cài đặt các dependency của dự án bằng npm:

```bash
npm install
```

### 5. Run Database Migrations

The project uses TypeORM for database management. After setting up your database and configuring the `.env` file, run the migrations to create the necessary tables:

```bash
npm run migration:run
```

_(Verify this script name in your `package.json` if it differs. The current `package.json` lists `npm run typeorm -- migration:run`, which can be simplified to `npm run migration:run` if that script is defined as such, which it is.)_

### 5. Chạy Database Migrations (Run Database Migrations - Vietnamese)

Dự án sử dụng TypeORM để quản lý cơ sở dữ liệu. Sau khi thiết lập cơ sở dữ liệu và cấu hình tệp `.env`, hãy chạy migrations để tạo các bảng cần thiết:

```bash
npm run migration:run
```

_(Xác minh tên script này trong `package.json` của bạn nếu nó khác. `package.json` hiện tại liệt kê `npm run typeorm -- migration:run`, có thể được đơn giản hóa thành `npm run migration:run` nếu script đó được định nghĩa như vậy, và đúng là như vậy.)_

### 6. Start the Application

You can start the application in development mode (with auto-reloading on file changes):

```bash
npm run start:dev
```

Alternatively, for a simple start:

```bash
npm run start
```

For production:

```bash
npm run build
npm run start:prod
```

The application should now be running and connected to your Mezon bot, database, and Redis instance.

### Khởi động ứng dụng (Start the Application - Vietnamese)

Bạn có thể khởi động ứng dụng ở chế độ development (với tính năng tự động tải lại khi có thay đổi tệp):

```bash
npm run start:dev
```

Hoặc, để khởi động đơn giản:

```bash
npm run start
```

Đối với môi trường production:

```bash
npm run build
npm run start:prod
```

Ứng dụng bây giờ sẽ chạy và kết nối với Mezon bot, cơ sở dữ liệu và instance Redis của bạn.

## Bot Usage

1.  Ensure the bot is running and connected to your Mezon workspace.
2.  In a configured Mezon channel, send a message starting with `*guicv`.
3.  Attach a file to this message. Valid file types are typically PDF or DOCX (this can be configured in `src/bot/commands/asterisk/apply-cv/apply-cv.constant.ts`).
4.  If the command and attachment are valid, the bot will reply with an interactive form.
5.  Fill in the details in the form.
6.  Click the "Submit" button on the form.
7.  The bot will process the submission.

### Cách sử dụng Bot (Bot Usage - Vietnamese)

1.  Đảm bảo bot đang chạy và đã kết nối với không gian làm việc Mezon của bạn.
2.  Trong một kênh Mezon đã được cấu hình, gửi một tin nhắn bắt đầu bằng `*guicv`.
3.  Đính kèm một tệp vào tin nhắn này. Các loại tệp hợp lệ thường là PDF hoặc DOCX (có thể cấu hình trong `src/bot/commands/asterisk/apply-cv/apply-cv.constant.ts`).
4.  Nếu lệnh và tệp đính kèm hợp lệ, bot sẽ trả lời bằng một biểu mẫu tương tác.
5.  Điền các chi tiết vào biểu mẫu.
6.  Nhấp vào nút "Submit" trên biểu mẫu.
7.  Bot sẽ xử lý việc gửi biểu mẫu.

## Available Scripts

- `npm run build`: Compiles the TypeScript application to JavaScript.
- `npm run format`: Formats code using Prettier.
- `npm run start`: Starts the application.
- `npm run start:dev`: Starts the application in watch mode for development.
- `npm run start:debug`: Starts the application in debug mode with watch.
- `npm run start:prod`: Starts the application in production mode (after building).
- `npm run lint`: Lints the codebase using ESLint.
- `npm run test`: Runs Jest unit tests.
- `npm run test:watch`: Runs Jest unit tests in watch mode.
- `npm run test:cov`: Runs Jest unit tests and generates a coverage report.
- `npm run typeorm -- <command>`: Runs TypeORM CLI commands (e.g., `migration:generate`, `migration:run`).
  - `npm run migration:generate -- -n MyMigrationName`: Generates a new migration.
  - `npm run migration:run`: Applies pending migrations.
  - `npm run migration:revert`: Reverts the last applied migration.

### Các Script có sẵn (Available Scripts - Vietnamese)

- `npm run build`: Biên dịch ứng dụng TypeScript sang JavaScript.
- `npm run format`: Định dạng mã bằng Prettier.
- `npm run start`: Khởi động ứng dụng.
- `npm run start:dev`: Khởi động ứng dụng ở chế độ theo dõi (watch mode) cho development.
- `npm run start:debug`: Khởi động ứng dụng ở chế độ debug kèm theo dõi.
- `npm run start:prod`: Khởi động ứng dụng ở chế độ production (sau khi build).
- `npm run lint`: Kiểm tra mã nguồn bằng ESLint.
- `npm run test`: Chạy unit test bằng Jest.
- `npm run test:watch`: Chạy unit test bằng Jest ở chế độ theo dõi.
- `npm run test:cov`: Chạy unit test bằng Jest và tạo báo cáo độ bao phủ (coverage report).
- `npm run typeorm -- <command>`: Chạy các lệnh TypeORM CLI (ví dụ: `migration:generate`, `migration:run`).
  - `npm run migration:generate -- -n MyMigrationName`: Tạo một migration mới.
  - `npm run migration:run`: Áp dụng các migration đang chờ xử lý.
  - `npm run migration:revert`: Hoàn tác migration đã áp dụng gần nhất.

## Project Structure (Overview)

- `src/`: Contains the main application source code.
  - `main.ts`: Entry point of the application.
  - `app.module.ts`: Root module of the application.
  - `common/`: Shared modules and services (like `CachingService`).
  - `config/`: Application configuration (env loading, etc.).
  - `bot/`: Core bot logic.
    - `commands/`: Bot command handlers (e.g., `ApplyCVCommand`).
    - `listeners/`: Event listeners (e.g., button clicks).
    - `services/`: Business logic services for the bot.
    - `entities/`: TypeORM database entities.
    - `repositories/`: Custom TypeORM repositories.
    - `utils/`: Utility functions and handlers (e.g., `FormExpirationHandler`).
  - `rest/`: API endpoints (if any, for external interactions like the CV form submission).
  - `mezon/`: Mezon SDK integration and client service.
  - `migration/`: Database migration files generated by TypeORM.
- `test/`: End-to-end and unit tests.
- `.env`: (You create this) Environment variables.
- `package.json`: Project dependencies and scripts.
- `tsconfig.json`: TypeScript compiler configuration.

### Cấu trúc dự án (Tổng quan - Vietnamese)

- `src/`: Chứa mã nguồn chính của ứng dụng.
  - `main.ts`: Điểm vào (entry point) của ứng dụng.
  - `app.module.ts`: Module gốc của ứng dụng.
  - `common/`: Các module và service dùng chung (như `CachingService`).
  - `config/`: Cấu hình ứng dụng (tải biến môi trường, v.v.).
  - `bot/`: Logic cốt lõi của bot.
    - `commands/`: Các trình xử lý lệnh của bot (ví dụ: `ApplyCVCommand`).
    - `listeners/`: Các trình lắng nghe sự kiện (ví dụ: nhấp chuột vào nút).
    - `services/`: Các service xử lý logic nghiệp vụ cho bot.
    - `entities/`: Các entity cơ sở dữ liệu TypeORM.
    - `repositories/`: Các repository TypeORM tùy chỉnh.
    - `utils/`: Các hàm và trình xử lý tiện ích (ví dụ: `FormExpirationHandler`).
  - `rest/`: Các API endpoint (nếu có, cho các tương tác bên ngoài như gửi biểu mẫu CV).
  - `mezon/`: Tích hợp Mezon SDK và client service.
  - `migration/`: Các tệp migration cơ sở dữ liệu được tạo bởi TypeORM.
- `test/`: Các bài kiểm thử end-to-end và unit test.
- `.env`: (Bạn tạo tệp này) Các biến môi trường.
- `package.json`: Các dependency và script của dự án.
- `tsconfig.json`: Cấu hình trình biên dịch TypeScript.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

### Đóng góp (Contributing - Vietnamese)

Chúng tôi hoan nghênh các pull request. Đối với những thay đổi lớn, vui lòng mở một issue trước để thảo luận về những gì bạn muốn thay đổi.

Vui lòng đảm bảo cập nhật các bài kiểm thử một cách thích hợp.

## License

[NCC+](https://ncc.asia/#)

### Giấy phép (License - Vietnamese)

[NCC+](https://ncc.asia/#)

