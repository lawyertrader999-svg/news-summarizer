# คำแนะนำการ Deploy บน Vercel

## ข้อมูลโปรเจกต์
- **ชื่อโปรเจกต์**: เครื่องมือสรุปข่าวจากลิงก์
- **GitHub Repository**: https://github.com/lawyertrader999-svg/news-summarizer
- **เทคโนโลยี**: Next.js, Tailwind CSS, OpenAI API

## ขั้นตอนการ Deploy บน Vercel

### 1. เข้าสู่ Vercel
- ไปที่ https://vercel.com/new
- เข้าสู่ระบบด้วย GitHub account

### 2. Import Repository
- คลิก "Import Git Repository"
- เลือก repository: `lawyertrader999-svg/news-summarizer`
- คลิก "Import"

### 3. ตั้งค่า Environment Variables
ในหน้า Project Settings > Environment Variables เพิ่ม:
```
OPENAI_API_KEY=your_openai_api_key_here
```

### 4. Deploy
- คลิก "Deploy"
- รอให้ deployment เสร็จสิ้น (ประมาณ 2-3 นาที)

## ฟีเจอร์ของแอป

### หน้าหลัก
- ช่องกรอก URL ของบทความข่าว
- ปุ่ม "สรุปข่าว"
- แสดงผลสรุปที่ได้จาก AI

### API Endpoint
- `POST /api/summarize`
- รับ URL และส่งคืนสรุปข่าว 3-5 บรรทัด

### การทำงาน
1. ผู้ใช้วาง URL ของบทความข่าว
2. ระบบดึงเนื้อหาจากเว็บไซต์ด้วย Cheerio
3. ใช้ OpenAI API (gpt-4.1-mini) สรุปเนื้อหา
4. แสดงผลสรุปบนหน้าจอ

## การทดสอบ
แอปได้ทดสอบการทำงานแล้วใน development mode และสามารถ:
- ดึงเนื้อหาจาก URL ได้สำเร็จ
- สรุปข่าวด้วย AI ได้ถูกต้อง
- แสดงผลบน UI ได้เรียบร้อย

## หมายเหตุ
- ต้องมี OpenAI API key ที่ใช้งานได้
- รองรับเฉพาะ URL ที่สามารถเข้าถึงได้แบบ public
- ออกแบบให้ responsive รองรับทุกอุปกรณ์
