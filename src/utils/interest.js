function interest(arr, address) {
    for(let i = 0; i < arr.length; i++) {
        const area = arr[i]
        if (area) {
            if (address.toLowerCase().includes(area.toLowerCase())) {
                console.log("🚀 ~ file: interest.js ~ line 6 ~ interest ~ address.toLowerCase()", address.toLowerCase())
                return true
            }
        }
    }
    return false
}


module.exports = {
    interest: interest
}