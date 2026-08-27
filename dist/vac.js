"use strict";
(() => {
  // src/index.ts
  (async function() {
    const apiKey = "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
    const index = {};
    const querySelector = ".friend_block_v2";
    const steamProfiles = Array.from(
      document.querySelectorAll(querySelector)
    );
    const add = (a, b) => {
      const aReversed = a.split("").reverse();
      const bReversed = b.split("").reverse();
      const result = [];
      let carry = 0;
      for (let i = 0; i < Math.max(aReversed.length, bReversed.length); i++) {
        const sum = parseInt(aReversed[i] || "0", 10) + parseInt(bReversed[i] || "0", 10) + carry;
        result.push(sum % 10);
        carry = Math.floor(sum / 10);
      }
      if (carry > 0) {
        result.push(carry);
      }
      return result.reverse().join("");
    };
    const getCommunityId = (steamProfile) => {
      const base = "76561197960265728";
      const steamId3 = steamProfile.dataset.miniprofile;
      if (!steamId3) {
        throw new Error("Missing [data-miniprofile]");
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
    const applyVacation = (player) => {
      const steamProfileElements = index[player.SteamId];
      steamProfileElements.forEach((steamProfileElement) => {
        const div = document.createElement("div");
        const friendSmallText = steamProfileElement.querySelector(".friend_small_text");
        let text = "";
        if (player.NumberOfGameBans || player.VACBanned) {
          if (player.NumberOfGameBans) {
            text += `${player.NumberOfGameBans} Game`;
          }
          if (player.VACBanned) {
            text += `${text ? ", " : ""}${player.NumberOfVACBans} VAC`;
          }
          text += ` ${player.DaysSinceLastBan} days ago`;
          div.style.color = "#a94847";
          div.textContent = text;
        } else {
          steamProfileElement.style.opacity = "0.1337";
        }
        if (!friendSmallText) {
          return;
        }
        friendSmallText.textContent = "";
        friendSmallText.appendChild(div);
      });
    };
    const getPlayerBans = async (players) => {
      const steamIds = players.join(",");
      const url = `https://api.steampowered.com/ISteamUser/GetPlayerBans/v1/?key=${apiKey}&steamids=${steamIds}`;
      try {
        const response = await fetch(url);
        const data = await response.json();
        data.players.forEach(applyVacation);
      } catch (error) {
      }
    };
    const steamCommunityIds = Object.keys(index);
    while (steamCommunityIds.length > 0) {
      const segment = steamCommunityIds.splice(0, 100);
      await getPlayerBans(segment);
    }
  })();
})();
