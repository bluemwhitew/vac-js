(async function () {
    const apiKey = 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
    const index = {};
    const querySelector = '.friend_block_v2';
    const steamProfiles = Array.from(document.querySelectorAll(querySelector));

    /**
     * Apply Calculations with Strings
     *
     * @param {String} a
     * @param {String} b
     * @returns {String}
     */
    const add = (a, b) => {
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
     *
     * @param {HTMLElement} steamProfile
     * @returns {String}
     */
    const getCommunityId = (steamProfile) => {
        const base = '76561197960265728'; // Buttery Biscuit Base
        const steamId3 = steamProfile.dataset.miniprofile;

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
     *
     * @param {Object} player
     * @property {String} player.SteamId
     * @property {Boolean} player.VACBanned
     * @property {Number} player.NumberOfVACBans
     * @property {Number} player.DaysSinceLastBan
     * @property {Number} player.NumberOfGameBans
     * @see https://developer.valvesoftware.com/wiki/Steam_Web_API
     */
    const applyVacation = (player) => {
        const steamProfileElements = index[player.SteamId];

        steamProfileElements.forEach((steamProfileElement) => {
            const div = document.createElement('div');
            const friendSmallText = steamProfileElement.querySelector('.friend_small_text');
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

            friendSmallText.textContent = '';
            friendSmallText.appendChild(div);
        });
    };

    /**
     * Create HTTP Request to Steam API
     *
     * @param {Object} players
     * @see https://developer.valvesoftware.com/wiki/Steam_Web_API
     */
    const getPlayerBans = async (players) => {
        const steamIds = players.join(',');
        const url = `https://api.steampowered.com/ISteamUser/GetPlayerBans/v1/?key=${apiKey}&steamids=${steamIds}`;

        try {
            const response = await fetch(url);
            const data = await response.json();

            if (data.players) {
                data.players.forEach(applyVacation);
            }
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
