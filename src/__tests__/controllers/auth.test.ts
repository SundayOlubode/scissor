import supertest from "supertest"
import app from '../../app'
import { IUser, Users } from '../../models/userSchema'



describe('Sign Up', () => {
    describe('If long Url is valid', () => {
        it('Create short Url', async () => {

            const req = {
                body: {
                    email: 'testing@gmail.com',
                    password: 'password',
                    firstname: 'Firstname',
                    lastname: 'Lastname'
                }
            }

            const signUpMock = jest.spyOn(Users, 'create')

            const { statusCode, body } = await supertest(app).post('/api/v1/signup')
            expect(statusCode).toBe(201)
        })
    })

})