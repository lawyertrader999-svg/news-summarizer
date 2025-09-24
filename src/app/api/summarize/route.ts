import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import * as cheerio from 'cheerio';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'กรุณาระบุ URL ของบทความข่าว' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'รูปแบบ URL ไม่ถูกต้อง' },
        { status: 400 }
      );
    }

    // Fetch the webpage content
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'ไม่สามารถเข้าถึง URL ที่ระบุได้' },
        { status: 400 }
      );
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract title
    const title = $('title').text().trim() || 
                  $('h1').first().text().trim() || 
                  $('meta[property="og:title"]').attr('content') || 
                  'ไม่พบหัวข้อ';

    // Extract main content
    // Try different selectors for article content
    let content = '';
    const contentSelectors = [
      'article',
      '[role="main"]',
      '.content',
      '.article-content',
      '.post-content',
      '.entry-content',
      'main',
      '.main-content'
    ];

    for (const selector of contentSelectors) {
      const element = $(selector);
      if (element.length > 0) {
        content = element.text().trim();
        break;
      }
    }

    // Fallback: get all paragraph text
    if (!content) {
      content = $('p').map((_, el) => $(el).text().trim()).get().join(' ');
    }

    // Clean up content
    content = content
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, ' ')
      .trim();

    if (!content || content.length < 100) {
      return NextResponse.json(
        { error: 'ไม่สามารถดึงเนื้อหาจากหน้าเว็บได้ หรือเนื้อหามีน้อยเกินไป' },
        { status: 400 }
      );
    }

    // Limit content length for API efficiency
    const maxContentLength = 4000;
    if (content.length > maxContentLength) {
      content = content.substring(0, maxContentLength) + '...';
    }

    // Generate summary using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: "คุณเป็นผู้เชี่ยวชาญในการสรุปข่าวภาษาไทย กรุณาสรุปเนื้อหาที่ได้รับให้เป็นข้อความที่กระชับ เข้าใจง่าย และครอบคลุมประเด็นสำคัญ ใช้ภาษาไทยที่เป็นทางการแต่เข้าใจง่าย สรุปให้อยู่ในช่วง 3-5 บรรทัด"
        },
        {
          role: "user",
          content: `กรุณาสรุปข่าวต่อไปนี้:\n\nหัวข้อ: ${title}\n\nเนื้อหา: ${content}`
        }
      ],
      max_tokens: 300,
      temperature: 0.3,
    });

    const summary = completion.choices[0]?.message?.content?.trim();

    if (!summary) {
      return NextResponse.json(
        { error: 'ไม่สามารถสร้างสรุปได้ กรุณาลองใหม่อีกครั้ง' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      summary,
      originalTitle: title
    });

  } catch (error) {
    console.error('Error in summarize API:', error);
    
    if (error instanceof Error && error.message.includes('API key')) {
      return NextResponse.json(
        { error: 'ไม่สามารถเชื่อมต่อกับบริการ AI ได้' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' },
      { status: 500 }
    );
  }
}
