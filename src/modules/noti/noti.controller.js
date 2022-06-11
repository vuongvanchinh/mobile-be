
const User = require('../user/user.model')
const { Expo } = require('expo-server-sdk');
const { Motel } = require('../motel/motel.model');

class NotiController {

    async pushNoti(req, res, next) {
        const { id } = req.query
        const userId = req.user._id
        const expo = new Expo()

        const motel = await Motel.findOne({ _id: id })
        if (motel) {
            User.find({ _id: { $ne: id } }).select('expoToken').then(rs => {
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

                    console.log(item.expoToken)
                    messages.push({
                        to: item.expoToken,
                        sound: 'default',
                        body: `Vừa có một phòng mới ở ${motel.address}`,
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
                res.json({
                    message: "send"
                })


            })

        }

    }
}

module.exports = new NotiController()