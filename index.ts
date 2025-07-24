import express, { Request, Response } from 'express';

const app = express();
const port = 3003;

app.get('/', (req: Request, res: Response) => {
  res.send("hello world");
})

app.listen(port, () => {
  console.log(`website đang chạy trên cổng ${port}`);
});
