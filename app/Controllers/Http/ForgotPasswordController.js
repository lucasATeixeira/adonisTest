'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */

const crypto = require('crypto')
const { isBefore, addDays } = require('date-fns')

const User = use('App/Models/User')
const Mail = use('Mail')

class ForgotPasswordController {
  async store ({ request, response }) {
    try {
      const email = request.input('email')
      const redirectUrl = request.input('redirect_url')

      const user = await User.findByOrFail('email', email)

      user.token = crypto.randomBytes(10).toString('hex')
      user.token_created_at = new Date()

      await user.save()

      await Mail.send(
        ['emails.forgot_password'],
        {
          email,
          token: user.token,
          link: `${redirectUrl}?token=${user.token}`
        },
        message => {
          message
            .to(email)
            .from('lucas.teixeira@realcf.online', 'Lucas | Teixeira')
            .subject('Recuperação de senha')
        }
      )
    } catch (err) {
      return response
        .status(err.status)
        .send({ error: { message: 'Algo não deu certo, este e-mail existe?' } })
    }
  }

  async update ({ request, response }) {
    try {
      const { token, password } = request.all()

      const user = await User.findByOrFail('token', token)

      const whenTokenExpires = addDays(user.token_created_at, 2)

      const tokenExpired = isBefore(whenTokenExpires, new Date())
      if (tokenExpired) {
        return response
          .status(401)
          .send({ error: { message: 'O token de recuperação está expirado' } })
      }

      user.token = null
      user.token_created_at = null

      user.password = password

      await user.save()
    } catch (err) {
      return response
        .status(err.status)
        .send({ error: { message: 'Algo deu errado ao resetar sua senha' } })
    }
  }
}

module.exports = ForgotPasswordController
