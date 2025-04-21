const fs = require('fs');
const path = require('path');

// JSON 파일 경로 설정
const apiKeyFilePath = path.join(__dirname, 'apiKey.json');

// API 키 저장 함수
const saveAPIKey = (apiKey) => {
    const data = { apiKey };
    fs.writeFileSync(apiKeyFilePath, JSON.stringify(data));
};

// API 키 불러오기 함수
const loadAPIKey = () => {
    if (fs.existsSync(apiKeyFilePath)) {
        const data = fs.readFileSync(apiKeyFilePath);
        const json = JSON.parse(data);
        return json.apiKey;
    }
    return null;
};

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Configuration, OpenAIApi } = require('openai');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post('/api/generate-sermon', async (req, res) => {
    const { prompt } = req.body;
    const apiKey = prompt.apiKey || loadAPIKey(); // 클라이언트에서 전달된 API 키 사용, 없으면 JSON에서 불러오기
    const configuration = new Configuration({
        apiKey,
    });
    const openai = new OpenAIApi(configuration);

    try {
        const response = await openai.createCompletion({
            model: 'text-davinci-003',
            prompt: prompt.sermonTopic || prompt.bibleVerse,
            max_tokens: 1500,
        });
        res.json({ sermon: response.data.choices[0].text });
    } catch (error) {
        console.error('OpenAI API 호출 중 오류 발생:', error);
        res.status(500).send('서버 오류');
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`서버가 ${PORT}에서 실행 중입니다.`);
});
