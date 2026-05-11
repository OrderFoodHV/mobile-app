export type AccountData = {
  user_name: string,
  email: string
  role?: string
  token?: string
  password?: string
}

type LoginSuccess = {
  success: boolean,
  message: string
  user_name: string,
  user_avatar: string,
  role: string,
  email: string
  token?: string
}

type RegisterSuccess = {
  success: boolean,
  message: string
  user_name: string,
  role: string,
  email: string
  token?: string
}

export type LoginSendData = {
  email: string
  password: string
}

export type RegisterSendData = {
  email: string
  user_name: string
  password: string
}

export type AuthProps = {
  loginResponse: LoginSuccess | null | any,
  registerResponse: RegisterSuccess | null | any
  account: null | AccountData,
  tokenData: null | string,
  authError: null | string,
  authLoading: boolean
}
