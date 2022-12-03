import * as fs from 'fs';
import path from 'path';

export class BlackListDomainsHelper {
    private static blacklistDomains: string[];

    public static get() {
        if (!this.blacklistDomains) {
            this.blacklistDomains = JSON.parse(
                fs
                    .readFileSync(
                        path.join(
                            __dirname,
                            '../../../../../src/server/util/data/blacklist-domains.json'
                        )
                    )
                    .toString()
            ).blacklistDomains;
        }
        return this.blacklistDomains;
    }
}
