
const User = require('../user/user.model')
const { Expo } = require('expo-server-sdk');
const {interest} = require('../../utils/interest')

async function pushNoti(mes, userId) {
    console.log("🚀 ~ file: createNoti.js ~ line 6 ~ pushNoti ~ mes", mes, userId)
    const expo = new Expo()
    User.find({ _id: { $ne: userId } }).select(['expoToken', 'favoriteAreas']).then(rs => {
        console.log("🚀 ~ file: createNoti.js ~ line 9 ~ User.find ~ rs", rs)
        let messages = []
        for (let item of rs) {
            if(item.expoToken) {
                console.log("🚀 ~ file: noti.controller.js ~ line 18 ~ NotiController ~ User.find ~ item", item)
            }
            // Check that all your push tokens appear to be valid Expo push tokens
            if (!Expo.isExpoPushToken(item.expoToken)) {
                // console.error(`Push token ${item.notiToken} is not a valid Expo push token`);
                continue;
            }
            if(!interest(item.favoriteAreas, mes)) {
                continue;
            }

            console.log("KK", item.expoToken)
            messages.push({
                to: item.expoToken,
                sound: 'default',
                body: `Có một bài đăng mới ở ${mes} `,
                title: "App",
                data: { withSome: 'data' },
            })
        }
        let chunks = expo.chunkPushNotifications(messages);
        let tickets = [];
        (async () => {
    
            for (let chunk of chunks) {
                try {
                    let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
                    console.log(ticketChunk);
                    tickets.push(...ticketChunk);
                } catch (error) {
                    console.error(error);
                }
            }
        })();
    }).catch((e) => {
        console.log("🚀 ~ file: createNoti.js ~ line 43 ~ User.find ~ e", e)
    })

}

module.exports = {
    pushNoti: pushNoti
}