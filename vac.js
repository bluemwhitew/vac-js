(function () {
    let apiKey = 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
        index = {},
        querySelector = '.friend_block_v2',
        segment,
        steamCommunityIds,
        steamProfiles = [].slice.call(document.querySelectorAll(querySelector));

    /**
     * Apply Calculations with Strings
     *
     * @param {String} a
     * @param {String} b
     * @returns {String}
     */
    function add(a, b) {
        let i,
            next,
            result = [],
            sum;

        a = a.split('').reverse();
        b = b.split('').reverse();

        for (i = 0; a[i] >= 0 || b[i] >= 0; i++) {
            sum = (parseInt(a[i], 10) || 0) + (parseInt(b[i], 10) || 0);

            if (!result[i]) {
                result[i] = 0;
            }

            next = (result[i] + sum) / 10 | 0;
            result[i] = (result[i] + sum) % 10;

            if (next) {
                result[i + 1] = next;
            }
        }

        return result.reverse().join('');
    }

    /**
     * Calculate Steam Community ID from `[data-miniprofile]` (SteamID3)
     *
     * @param {Object} steamProfile
     */
    function getCommunityId(steamProfile) {
        let base = '76561197960265728', // Buttery Biscuit Base
            steamId3 = steamProfile.dataset.miniprofile;

        return add(base, steamId3);
    }

    steamProfiles.forEach(function (steamProfile) {
        let steamId64 = getCommunityId(steamProfile);

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
     * @see {@link https://developer.valvesoftware.com/wiki/Steam_Web_API#Result_layout_6|Steam Web API (GetPlayerBans)}
     */
    function applyVacation(player) {
        let steamProfileElements = index[player.SteamId];

        steamProfileElements.forEach(function (steamProfileElement) {
            let div = document.createElement('div'),
                friendSmallText = steamProfileElement.querySelector('.friend_small_text'),
                text = '';

            if (player.NumberOfGameBans || player.VACBanned) {
                if (player.NumberOfGameBans) {
                    text += player.NumberOfGameBans + ' OW';
                }

                if (player.VACBanned) {
                    text += (text === '' ? '' : ', ') + player.NumberOfVACBans + ' VAC';
                }

                text += ' ' + player.DaysSinceLastBan + ' days ago';

                div.style.color = '#a94847';
                div.innerHTML = text;
            } else {
                steamProfileElement.style.opacity = '0.1337';
            }

            friendSmallText.innerHTML = '';
            friendSmallText.appendChild(div);
        });
    }

    /**
     * Create HTTP Request to Steam API
     *
     * @param {Object} players
     * @see {@link https://developer.valvesoftware.com/wiki/Steam_Web_API|Steam Web API}
     */
    function getPlayerBans(players) {
        let method = 'GET',
            responseText,
            steamIds = players.join(','),
            url = 'https://api.steampowered.com/ISteamUser/GetPlayerBans/v1/?key=' + apiKey + '&steamids=' + steamIds,
            xhr = new XMLHttpRequest();

        xhr.open(method, url, true);

        /** @property {Object} players */
        xhr.onreadystatechange = function () {
            if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                responseText = JSON.parse(xhr.responseText);
                responseText.players.forEach(applyVacation);
            }
        };

        xhr.send();
    }

    steamCommunityIds = Object.keys(index);

    // Segment IDs for HTTP Requests (Steam Web API Allows 100 Per Request)
    while (steamCommunityIds.length > 0) {
        segment = steamCommunityIds.splice(0, 100);
        getPlayerBans(segment);
    }
})();
