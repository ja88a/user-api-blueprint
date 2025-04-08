export const BASE_PATH =
  (process.env.ENV_DOMAIN === 'localhost'
    ? 'http://localhost:' + process.env.API_PORT
    : 'https://' + process.env.ENV_DOMAIN) + '/tuba-api'

export const USER_TEST_DEFAULT_EMAIL = 'jane.doe@domain.ext'
export const USER_TEST_DEFAULT_PWD = '$ecrEt-600!'
export const USER_TEST_DEFAULT_ACCOUNT_ADDR =
  '0x0E4716Dd910adeB96D9A82E2a7780261E3D94760'
