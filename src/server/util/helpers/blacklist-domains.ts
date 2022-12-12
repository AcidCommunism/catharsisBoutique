import * as fs from 'fs';
import path from 'path';
import { logger } from '../../../logger';

export class BlackListDomainsHelper {
    private static blacklistDomains: string[];
    private static blacklistFilePath = path.join(
        __dirname,
        '../../../../../src/server/util/data/blacklist-domains.json'
    );

    private static _readFromFile() {
        let domains: string[];
        try {
            domains = JSON.parse(
                fs.readFileSync(this.blacklistFilePath).toString()
            ).blacklistDomains;
            return domains;
        } catch (error) {
            logger.error(
                `Error reading file at path: ${this.blacklistFilePath}`
            );
            logger.error(error);
            domains = ['zhopa.ass'];
            return domains;
        }
    }

    public static get() {
        if (!this.blacklistDomains) {
            this.blacklistDomains = this._readFromFile();
        }
        return this.blacklistDomains;
    }
}
