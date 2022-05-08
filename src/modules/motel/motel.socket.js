const { Motel } = require('./motel.model')
const motelSocket = (io) => {
    io.on("created-motel", (socket) => {
        console.log(socket, typeof socket)
        const f = async () => {
            try {
                const motel = await Motel.findOne({_id: socket})
                if (motel) {
                    io.emit("new-motel", motel)
                }
            } catch (error) {
                console.log(error)
            }
        }
        f()
    })
}
module.exports = motelSocket;