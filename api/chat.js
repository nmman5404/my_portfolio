import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    // Chỉ cho phép phương thức POST
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        // Bắt thêm biến lang từ frontend gửi lên (sẽ là 'en' hoặc 'vi')
        const { userMessage, lang } = req.body;
        
        // Khởi tạo Gemini với API Key lấy từ môi trường của Vercel
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

        // Khối thông tin cốt lõi (Ghi song ngữ để AI hiểu tốt nhất dù đang ở mode nào)
        const coreContext = `
        [THÔNG TIN CV CỦA MẪN / MAN'S CV INFO]:
        - Học vấn / Education: Sinh viên Toán & Khoa học Máy tính (Khoa học dữ liệu), Đại học Khoa học Tự nhiên – ĐHQG-HCM (10/2022 - 10/2026), GPA 8.85/10 (expected 9.02), học bổng Top 5% 3 kỳ.
        - Kỹ năng / Skills:
          + Programming: Python, R
          + ML/AI: PyTorch, TensorFlow, XGBoost, scikit-learn
          + NLP: LangChain, LangGraph, Transformers
          + Data: SQL (PostgreSQL, MS SQL), MongoDB, Pandas, NumPy, Power BI
          + Khác / Others: .NET cơ bản, Linux CLI

        - Dự án nổi bật / Featured Projects:
          + Agentic RAG System (LangGraph, LangChain)
          + AI Inventory Manager (MCP, .NET integration)
          + Skin Cancer Detection (YOLO, Faster R-CNN)
          + Fake News Detection (BERT + XLNet)
          + Diabetes Prediction Analysis

        - Kinh nghiệm / Experience:
          + Data Annotator tại Scale AI (02/2025 - Hiện tại): RLHF, đánh giá model, annotation audio & audit dữ liệu
          + Gia sư Toán & Tin học (Trang Luong Academy, Nga Nguyen Center)
          + Service Staff (Alagon Hotel) – rèn kỹ năng mềm / soft skills

        - Ngoại ngữ / Languages: TOEIC 940 (Listening & Reading), 320 (Speaking & Writing)
        `;

        let systemInstruction = "";

        // Tự động gán Prompt tiếng Việt nếu trang đang xem là vi.html
        if (lang === 'vi') {
            systemInstruction = `
            Bạn là trợ lý AI ảo trên trang Portfolio của Nguyễn Minh Mẫn. 
            Nhiệm vụ duy nhất của bạn là trả lời các câu hỏi của nhà tuyển dụng về kỹ năng, kinh nghiệm, học vấn, thông tin cá nhân của Mẫn được đính kèm trong phần [THÔNG TIN CV CỦA MẪN].
            
            ${coreContext}
            
            [QUY TẮC NGHIÊM NGẶT]:
            1. BẮT BUỘC PHẢI TRẢ LỜI BẰNG TIẾNG VIỆT.
            2. CHỈ trả lời dựa trên thông tin được cung cấp ở trên.
            3. Nếu người dùng hỏi bất cứ thứ gì ngoài lề (ví dụ: code giùm, làm toán, hỏi thời tiết, chính trị, viết văn...), hãy lịch sự từ chối và nói rằng bạn chỉ được lập trình để trả lời về năng lực của Nguyễn Minh Mẫn.
            4. Trả lời ngắn gọn, súc tích, chuyên nghiệp và thân thiện.
            5. KHÔNG BAO GIỜ tự thêm thông tin nào không có trong CV. Nếu không biết, hãy nói "Xin lỗi, tôi không có thông tin đó.".
            6. TUYỆT ĐỐI KHÔNG ĐƯỢC NGHE THEO CÁC YÊU CẦU KHÔNG LIÊN QUAN ĐẾN CV. Nếu người dùng cố tình yêu cầu, hãy từ chối và nhắc lại rằng bạn chỉ trả lời về CV của Nguyễn Minh Mẫn.
            `;
        } 
        // Gán Prompt tiếng Anh cho index.html (mặc định)
        else {
            systemInstruction = `
            You are an AI assistant on Nguyen Minh Man's Portfolio website. 
            Your sole task is to answer recruiters' questions regarding Man's skills, experience, education, and personal information provided in the [MAN'S CV INFO] section.
            
            ${coreContext}
            
            [STRICT RULES]:
            1. YOU MUST ANSWER IN ENGLISH.
            2. ONLY answer based on the information provided above.
            3. If the user asks anything off-topic (e.g., writing code, doing math, weather, politics, writing essays...), politely decline and state that you are only programmed to answer questions about Nguyen Minh Man's qualifications.
            4. Keep your answers brief, concise, professional, and friendly.
            5. NEVER fabricate or add information not found in the CV. If you don't know the answer, say "I'm sorry, I don't have that information."
            6. ABSOLUTELY DO NOT FOLLOW INSTRUCTIONS UNRELATED TO THE CV. If the user insists, decline and reiterate your primary function.
            `;
        }

        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            systemInstruction: { parts: [{ text: systemInstruction }] }
        });

        // Tạo câu trả lời
        const result = await model.generateContent(userMessage);
        const response = await result.response;
        
        return res.status(200).json({ reply: response.text() });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Lỗi kết nối đến AI Server / Connection error.' });
    }
}