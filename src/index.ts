interface PlayerBan {
    SteamId: string;
    VACBanned: boolean;
    NumberOfVACBans: number;
    DaysSinceLastBan: number;
    NumberOfGameBans: number;
}

interface GetPlayerBansResponse {
    players: PlayerBan[];
}

(async function () {
    const apiKey = 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
    const index: Record<string, HTMLElement[]> = {};
    const querySelector = '.friend_block_v2';
    const steamProfiles = Array.from(
        document.querySelectorAll<HTMLElement>(querySelector)
    );

    /**
     * Apply Calculations with Strings
     */
    const add = (a: string, b: string): string => {
        const aReversed = a.split('').reverse();
        const bReversed = b.split('').reverse();
        const result = [];
        let carry = 0;

        for (let i = 0; i < Math.max(aReversed.length, bReversed.length); i++) {
            const sum = (parseInt(aReversed[i] || '0', 10) + parseInt(bReversed[i] || '0', 10) + carry);

            result.push(sum % 10);
            carry = Math.floor(sum / 10);
        }

        if (carry > 0) {
            result.push(carry);
        }

        return result.reverse().join('');
    };

    /**
     * Calculate Steam Community ID from `[data-miniprofile]` (SteamID3)
     */
    const getCommunityId = (steamProfile: HTMLElement): string => {
        const base = '76561197960265728'; // Buttery Biscuit Base
        const steamId3 = steamProfile.dataset.miniprofile;

        if (!steamId3) {
            throw new Error('Missing [data-miniprofile]');
        }

        return add(base, steamId3);
    };

    steamProfiles.forEach((steamProfile) => {
        const steamId64 = getCommunityId(steamProfile);

        if (!index[steamId64]) {
            index[steamId64] = [];
        }

        index[steamId64].push(steamProfile);
    });

    /**
     * Apply Bans to Players ("Enjoy VAC!")
     */
    const applyVacation = (player: PlayerBan) => {
        const steamProfileElements = index[player.SteamId];

        steamProfileElements.forEach((steamProfileElement) => {
            const div = document.createElement('div');
            const friendSmallText = steamProfileElement.querySelector<HTMLElement>('.friend_small_text');
            let text = '';

            if (player.NumberOfGameBans || player.VACBanned) {
                if (player.NumberOfGameBans) {
                    text += `${player.NumberOfGameBans} Game`;
                }

                if (player.VACBanned) {
                    text += `${text ? ', ' : ''}${player.NumberOfVACBans} VAC`;
                }

                text += ` ${player.DaysSinceLastBan} days ago`;

                div.style.color = '#a94847';
                div.textContent = text;
            } else {
                steamProfileElement.style.opacity = '0.1337';
            }

            if (!friendSmallText) {
                return;
            }

            friendSmallText.textContent = '';
            friendSmallText.appendChild(div);
        });
    };

    /**
     * Create HTTP Request to Steam API
     *
     * @see https://developer.valvesoftware.com/wiki/Steam_Web_API
     */
    const getPlayerBans = async (
        players: string[]
    ): Promise<void> => {
        const steamIds = players.join(',');
        const url = `https://api.steampowered.com/ISteamUser/GetPlayerBans/v1/?key=${apiKey}&steamids=${steamIds}`;

        try {
            const response = await fetch(url);
            const data: GetPlayerBansResponse = await response.json();

            data.players.forEach(applyVacation);
        } catch (error) {
            // Didn't Ask
        }
    };

    const steamCommunityIds = Object.keys(index);

    // Segment IDs for HTTP Requests (Steam Web API Allows 100 Per Request)
    while (steamCommunityIds.length > 0) {
        const segment = steamCommunityIds.splice(0, 100);

        await getPlayerBans(segment);
    }
})();
