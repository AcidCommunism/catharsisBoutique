import { check, body } from 'express-validator/check';
import { User } from '../../models/user';
import { BlackListDomainsHelper } from '../../util/helpers/blacklist-domains';

export function signUpValidation() {
    return [
        check('email')
            .isEmail()
            .custom((value, { req }) => {
                BlackListDomainsHelper.get().forEach(domain => {
                    if (value.split('@')[1] === domain) {
                        throw new Error(
                            `Sorry, domain ${domain} is blacklisted`
                        );
                    }
                });
                return true;
            })
            .custom((value, { req }) => {
                return User.findOne({ email: value }).then(user => {
                    if (user) {
                        return Promise.reject(
                            `
                            User with e-mail <a href="mailto:${value}">${value}</a> already exists.
                            <p>Please pick a different one or <a href="/auth/reset-pwd">reset</a> your password.</p>
                            `
                        );
                    }
                });
            }),
        body(
            ['password'],
            'Please enter password with length of 6-24 symbols.'
        ).isLength({
            min: 6,
            max: 24,
        }),
        body('confirmPassword').custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords do not match!');
            }
            return true;
        }),
    ];
}
