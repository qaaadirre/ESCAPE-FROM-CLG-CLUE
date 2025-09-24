import nextConnect from "next-connect";
import multer from 'multer';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

const handler = nextConnect();
handler.use(upload.single('file'));

handler.post(async (req, res) => {
  // require S3 env vars
  const { AWS_REGION, S3_BUCKET } = process.env;
  if(!AWS_REGION || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !S3_BUCKET){
    return res.status(500).json({ error: 'S3 not configured. Set AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_BUCKET' })
  }
  const file = req.file;
  if(!file) return res.status(400).json({ error: 'no file' })

  const client = new S3Client({ region: process.env.AWS_REGION });
  const key = 'uploads/' + Date.now() + '-' + (file.originalname || 'file');

  try{
    await client.send(new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read'
    }));
    const url = `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    res.json({ url });
  }catch(err){
    console.error(err);
    res.status(500).json({ error: err.message })
  }
});

export const config = {
  api: { bodyParser: false }
}

export default handler;
