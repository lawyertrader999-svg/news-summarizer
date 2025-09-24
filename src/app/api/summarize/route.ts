import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

// Simple text summarization function
function simpleSummarize(text: string, maxSentences: number = 4): string {
  // Clean and split text into sentences
  const sentences = text
    .replace(/\s+/g, ' ')
    .trim()
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 20); // Filter out very short sentences

  if (sentences.length <= maxSentences) {
    return sentences.join(' ') + '.';
  }

  // Score sentences based on word frequency and position
  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  const wordFreq: { [key: string]: number } = {};
  
  // Calculate word frequency
  words.forEach(word => {
    if (word.length > 3) { // Ignore short words
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    }
  });

  // Score sentences
  const sentenceScores = sentences.map((sentence, index) => {
    const sentenceWords = sentence.toLowerCase().match(/\b\w+\b/g) || [];
    let score = 0;
    
    sentenceWords.forEach(word => {
      if (wordFreq[word]) {
        score += wordFreq[word];
      }
    });
    
    // Boost score for sentences at the beginning
    if (index < 3) {
      score *= 1.5;
    }
    
    return { sentence, score, index };
  });

  // Sort by score and take top sentences
  const topSentences = sentenceScores
    .sort((a, b) => b.score - a.score)
    .slice(0, maxSentences)
    .sort((a, b) => a.index - b.index) // Maintain original order
    .map(item => item.sentence);

  return topSentences.join(' ') + '.';
}

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

    // Generate summary using simple algorithm
    const summary = simpleSummarize(content, 4);

    if (!summary) {
      return NextResponse.json(
        { error: 'ไม่สามารถสร้างสรุปได้ กรุณาลองใหม่อีกครั้ง' },
        { status: 500 }
      );
    }

    return new NextResponse(JSON.stringify({
      success: true,
      summary,
      originalTitle: title
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });

  } catch (error) {
    console.error('Error in summarize API:', error);
    
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' },
      { status: 500 }
    );
  }
}
