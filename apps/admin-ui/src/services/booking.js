import axios from "./"

export const getBookings = () => {
    return axios.get("/bookings")
}

export const updateBooking = (id, data) => {
    return axios.patch(`/bookings/${id}`, data)
}

export const getBookingImage = (id) => {
    return axios.get(`/bookings/${id}`)
}
