# TypeScript Express FileUploader to S3

File uploader is a simple express typescript implementation for file upload and remove from S3.

## Installation

```bash
npm install or yarn
```

### Setup ENV  

Copy the `env.example` file to `.env` and update the S# credential.

```.env
APP_NAME=map
APP_ENV=local
APP_PORT=3000

# S3 Setup
AWS_BUCKET_NAME=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=ap-south-1
AWS_BUCKET_PATH=""
```

### Start Server  

`yarn dev` or `npm run dev` to start the server

### Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for any improvements or feature requests.

### License

This project is open-source software licensed under the [MIT license](https://opensource.org/licenses/MIT).

---
