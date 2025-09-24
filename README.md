# เครื่องมือสรุปข่าวจากลิงก์

เว็บแอปพลิเคชันที่ใช้ AI สรุปเนื้อหาจาก URL ของบทความข่าวให้เป็นข้อความที่กระชับและเข้าใจง่าย

## ฟีเจอร์หลัก

- **รับ URL**: ใส่ลิงก์ของบทความข่าวที่ต้องการสรุป
- **สรุปอัตโนมัติ**: ใช้ AI สรุปเนื้อหาให้เหลือ 3-5 บรรทัด
- **แสดงผลสวยงาม**: UI ที่ออกแบบด้วย Tailwind CSS
- **Responsive**: รองรับการใช้งานบนทุกอุปกรณ์

## เทคโนโลยีที่ใช้

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Backend**: Next.js API Routes
- **AI**: OpenAI GPT-4.1-mini
- **Web Scraping**: Cheerio
- **Deployment**: Vercel

## การติดตั้งและรัน

### 1. Clone Repository
```bash
git clone https://github.com/lawyertrader999-svg/news-summarizer.git
cd news-summarizer
```

### 2. ติดตั้ง Dependencies
```bash
npm install
```

### 3. ตั้งค่า Environment Variables
สร้างไฟล์ `.env.local` และเพิ่ม:
```
OPENAI_API_KEY=your_openai_api_key_here
```

### 4. รันในโหมด Development
```bash
npm run dev
```

เปิดเบราว์เซอร์ไปที่ http://localhost:3000

## การ Deploy บน Vercel

1. ไปที่ https://vercel.com/new
2. Import repository: `lawyertrader999-svg/news-summarizer`
3. เพิ่ม Environment Variable: `OPENAI_API_KEY`
4. Deploy

**GitHub Repository**: https://github.com/lawyertrader999-svg/news-summarizer

## วิธีใช้งาน

1. เปิดเว็บแอปพลิเคชัน
2. วาง URL ของบทความข่าวในช่องที่กำหนด
3. คลิกปุ่ม "สรุปข่าว"
4. รอสักครู่เพื่อให้ AI ประมวลผล
5. อ่านสรุปที่ได้

## API Endpoint

### POST /api/summarize

**Request Body:**
```json
{
  "url": "https://example.com/news-article"
}
```

**Response:**
```json
{
  "success": true,
  "summary": "สรุปข่าวใน 3-5 บรรทัด...",
  "originalTitle": "หัวข้อข่าวต้นฉบับ"
}
```

## ข้อจำกัด

- รองรับเฉพาะ URL ที่สามารถเข้าถึงได้แบบ public
- ต้องมี OpenAI API key ที่ใช้งานได้
- เนื้อหาต้องมีความยาวอย่างน้อย 100 ตัวอักษร

## License

MIT License
