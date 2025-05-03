const { WebcastPushConnection } = require('tiktok-live-connector');
const axios = require('axios');

// 未処理のPromise拒否をキャッチ
process.on('unhandledRejection', (reason, promise) => {
    console.error('未処理のPromise拒否:', reason);
});

// 未処理の例外をキャッチ
process.on('uncaughtException', (error) => {
    console.error('未処理の例外:', error);
});

// Username of someone who is currently live
let tiktokUsername = "gym_masao";

// Create a new wrapper object and pass the username
let tiktokLiveConnection = new WebcastPushConnection(tiktokUsername);

// 接続が切断された場合の処理
tiktokLiveConnection.on('disconnected', () => {
    console.log('接続が切断されました。再接続を試みます...');
    setTimeout(() => {
        tiktokLiveConnection.connect().catch(err => {
            console.error('再接続に失敗しました:', err);
        });
    }, 5000); // 5秒後に再接続を試みる
});

// Connect to the chat (await can be used as well)
tiktokLiveConnection.connect().then(state => {
    console.info(`Connected to roomId ${state.roomId}`);
}).catch(err => {
    console.error('Failed to connect', err);
    // 接続失敗時も再接続を試みる
    setTimeout(() => {
        tiktokLiveConnection.connect().catch(err => {
            console.error('再接続に失敗しました:', err);
        });
    }, 5000);
})

// And here we receive gifts sent to the streamer
tiktokLiveConnection.on('gift', data => {
    if(data.repeatEnd == 0){
        // Streak in progress => show only temporary
        console.log(`(userId:${data.user.nickname}) sends ${data.giftId}`);
        // localhost:3000/giftにGETリクエストを送信
        axios.get('http://localhost:3000/gift', {
            params: {
                giftId: data.giftId,
                userName: data.user.nickname,
            }
        }).catch(error => {
            console.error('ギフト情報の送信に失敗しました:', error.message);
        });
    }
})

// プロセスが終了しないようにする
setInterval(() => {
    // 何もしない
}, 1000 * 60 * 60); // 1時間ごとに実行