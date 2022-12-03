import { check, body } from 'express-validator/check';
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
