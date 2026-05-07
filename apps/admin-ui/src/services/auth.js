import axios from "./"

export const login = (data) => {
    return axios.post('/admin/login', data)
}
