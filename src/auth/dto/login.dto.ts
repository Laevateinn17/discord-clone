
export class LoginDTO {
    identifier: string;
    password: string;

    validate(): string {
        if (!this.identifier || this.identifier.length == 0) {
            return 'Username or email cannot be empty'
        }

        if (!this.password || this.password.length == 0) {
            return 'Password cannot be empty'
        }
    }
}
