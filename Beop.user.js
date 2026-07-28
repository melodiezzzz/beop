// ==UserScript==
// @name         법 (Beop)
// @namespace    objection.lol
// @description  An unpolished unfinished shitty garbage poop QOL extension for objection.lol
// @icon         https://objection.lol/favicon.ico
// @version      v0.830
// @author       Paddy/Danielle
// @license      CC0
// @match        https://objection.lol/courtroom
// @match        https://objection.lol/courtroom/*
// @run-at       document-start
// @grant        GM_xmlhttpRequest
// @grant        GM.xmlHttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @connect      catbox.moe
// @connect      api.filegarden.com
// @connect      file.garden
// @connect      api.fxtwitter.com
// @connect      reddit.com
// @connect      www.reddit.com
// @connect      youtube.com
// @connect      video.twimg.com
// @connect      *
// @connect      safe.cyctorn.tech
// @connect      tenor.com
// @connect      www.tiktok.com
// @connect      vm.tiktok.com
// @connect      api.tenor.com
// @connect      api.giphy.com
// @connect      media0.giphy.com
// @connect      media1.giphy.com
// @connect      media2.giphy.com
// @connect      media3.giphy.com
// @connect      media4.giphy.com
// @connect      klipy.com
// @connect      api.klipy.com
// @connect      static.klipy.com
// @connect      a.4cdn.org
// @connect      cdn.discordapp.com
// @connect      media.discordapp.com
// @connect      i.4cdn.org
// @connect      boards.4chan.org
// @connect      boards.4channel.org
// @connect      open.spotify.com
// @connect      github.com
// @connect      api.github.com
// @connect      store.steampowered.com
// @connect      arch-img.b4k.dev
// @downloadURL https://update.greasyfork.org/scripts/578034/%EB%B2%95%20%28Beop%29.user.js
// @updateURL https://update.greasyfork.org/scripts/578034/%EB%B2%95%20%28Beop%29.meta.js
// ==/UserScript==

(function () {
    "use strict";

    // Pre-hide the native MUI top bar the instant the script runs so it
    // never flashes before our #ep-top-cover takes its place.
    (function() {
        const s = document.createElement('style');
        s.id = 'ep-prehide';
        s.textContent =
            '.MuiAppBar-root,header.MuiPaper-root,'
            + '.MuiToolbar-root,.MuiLinearProgress-root,'
            + '[role=progressbar],[class*=MuiLinearProgress],'
            + '#root>div>header,#root>header,'
            + '#root>div>[class*=MuiAppBar],'
            + 'div[role=tablist]'
            + '{opacity:0!important;pointer-events:none!important;}';
        (document.head || document.documentElement).appendChild(s);
    })();

    // ─── Compat helpers ────────────────────────────────────────────────────────
    const gmRequest = (typeof GM !== 'undefined' && GM?.xmlHttpRequest)
        || (typeof GM_xmlhttpRequest !== 'undefined' && GM_xmlhttpRequest);
    const gmSet = (typeof GM_setValue !== 'undefined') ? GM_setValue
        : (k, v) => localStorage.setItem('enhancer_' + k, JSON.stringify(v));
    const gmGet = (typeof GM_getValue !== 'undefined') ? GM_getValue
        : (k, d) => { try { const v = localStorage.getItem('enhancer_' + k); return v !== null ? JSON.parse(v) : d; } catch { return d; } };

    // ─── Settings ──────────────────────────────────────────────────────────────
    const DEFAULTS = {
        // Notifications
        highlightWords: "",
        playSoundOnHighlight: false,
        notificationSoundUrl: "",
        notificationSoundVolume: 0.5,
        notificationSoundSeek: 0,
        notificationSoundDuration: 0,
        // Media embeds
        imageHoverPopup: true,
        videoHoverPopup: true,
        audioHoverPopup: true,
        youtubeHoverPopup: true,
        twitterHoverPopup: true,
        tenorHoverPopup: true,
        klipyHoverPopup: true,
        fourchanHoverPopup: true,
        inlineImages: true,
        // Chat behavior
        suppressOwnTyping: false,
        compactMode: false,
        chatFontSize: 13,
        autoScroll: true,
        mentionSound: false,
        myUsername: "",
        selfHighlight: true,
        blockedUsers: "",
        // UI / Reskin
        chatReskin: true,
        chatBlur: 14,
        messageBubbleStyle: 'flat',
        accentGlow: true,
        chatOpacity: 0.97,
        chatAccentColor:  "#e05a2b",
        chatAccentColor2: "",       // gradient end (empty = solid)
        // Top Bar
        topBarStyle: "auto",        // "auto"|"solid"|"glass"|"dark"|"gradient"
        topBarBg: "",               // custom color (solid / gradient start)
        topBarBg2: "",              // gradient end color
        topBarTextColor: "",        // custom text color (empty = white auto)
        topBarBlur: 12,             // backdrop-filter blur px (glass mode)
        topBarBorderBottom: true,   // 1px border under top bar
        topBarShowStats: true,      // show msgs/users counters
        // Messages
        ownMsgBg: "",               // own-message row bg override
        mentionBg: "",              // mention-highlight bg override
        msgHoverBg: "",             // hover bg override
        linkColor: "",              // link text color override
        // UI Chrome
        uiBorderRadius: 8,          // buttons/inputs/panels border-radius px
        scrollbarWidth: "thin",     // "thin"|"wide"|"hidden"
        scrollbarColor: "",         // scrollbar thumb color
        // Chat Pattern
        chatPattern: "none",        // "none"|"dots"|"grid"|"lines"|"diamonds"
        chatPatternColor: "",       // pattern color (empty = accent)
        chatPatternOpacity: 0.04,   // 0–0.2
        // Custom CSS
        customCSS: "",              // raw CSS injected after all other styles
        chatFont: "system",
        chatFontCustomUrl: "",
        // Hotkeys
        disableHotkeys: false,
        enhancerHotkeys: true,
        // Misc
        fixEvidenceStretch: true,
        showMsgContext: false,
        imageFramePopup: true,
        threadingEnabled: false,
        framePopupSize: 'medium',
        showTimestamps: false,
        leaveWarning: true,
        catboxUpload: true,
        uploadProvider: "catbox",
        showCatboxStatus: false,
        filegardenUserId: "",
        filegardenToken: "",
        cyctornToken: "",
        exportFormat: "txt",
        // Background
        backgroundEnabled: false,
        backgroundPreset: "none",
        backgroundCustomUrl: "",
        backgroundDim: 0.55,
        backgroundBlur: 0,
        // Widgets
        showClock: true,
        clockFormat24h: false,
        showNowPlaying: true,
        // Sound effects
        sfxVolume: 0.5,
        sfxJoinUrl: "https://safe.cyctorn.tech/T4lKPHdS.mp3",
        sfxLeaveUrl: "https://safe.cyctorn.tech/VacIrGDE.mp3",
        sfxPairUrl: "https://safe.cyctorn.tech/PVcbyqRi.mp3",
        sfx8ballUrl: "https://safe.cyctorn.tech/geewKzt2.mp3",
        sfxRollUrl: "https://safe.cyctorn.tech/geewKzt2.mp3",
        // New embeds
        spotifyHoverPopup: true,
        googleDocHoverPopup: true,
        githubHoverPopup: true,
        steamHoverPopup: true,
        // GIF Picker
        gifPickerSource: "giphy",
        giphyApiKey: "t2zvylZkP80HTzBss1aQjoFOvFnwhhqY",
        klipyApiKey: "tNjXyZXgIm5PM2qaIUioKrVJdWuyIb2EFzPOKOe9TL1LSujfZGhlT73KDDK7M1QP",
        // TTS
        ttsEnabled: false,
        ttsRate: 1.0,
        ttsPitch: 1.0,
        ttsVolume: 1.0,
        ttsVoice: "",
        ttsSpeakUsername: true,
        ttsSkipUrls: true,
        ttsAutoAssignVoice: true, // auto-pick a random voice for users who have none
        ttsUserVoices: {},   // { "username_lower": { voice:"", pitch:1.0, rate:1.0 } }
        ttsInterruptSelf: true,    // cancel own current speech when same user sends again
    };

    let settings = {};
    let chatLog = [];
    let pendingReplyTo = null; // { id, user, text } set when reply btn is clicked
    let filterMentions = false; // @Me toggle
    let filterByUser   = false; // User filter toggle
    let filterUser = '';        // username for user filter

    function loadSettings() {
        const saved = gmGet('enhancer_settings', {});
        return Object.assign({}, DEFAULTS, saved);
    }
    function saveSettings() {
        gmSet('enhancer_settings', settings);
        window.dispatchEvent(new Event('ep-settings-changed'));
    }

    const JOIN_USERNAME_KEY = 'objection_join_username';

    function setInputValue(input, value) {
        const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
        if (nativeSetter) {
            nativeSetter.call(input, value);
        } else {
            input.value = value;
        }
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
    }

    function tryInitJoinDialog(dialog) {
        if (!(dialog instanceof HTMLElement) || dialog.dataset.epJoinDialogInit === '1') return;

        const usernameInput = dialog.querySelector('input[type="text"][maxlength="32"]');
        if (!usernameInput) return;

        const savedValue = localStorage.getItem(JOIN_USERNAME_KEY);
        if (savedValue) {
            setInputValue(usernameInput, savedValue);
        }

        const joinButton = Array.from(dialog.querySelectorAll('button[type="button"]'))
            .find(btn => btn.textContent.trim() === 'Join');
        if (joinButton) {
            joinButton.addEventListener('click', () => {
                const value = usernameInput.value.trim();
                if (value) {
                    localStorage.setItem(JOIN_USERNAME_KEY, value);
                }
            }, { once: true });
        }

        usernameInput.addEventListener('keydown', event => {
            if (event.key === 'Enter') {
                const value = usernameInput.value.trim();
                if (value) {
                    localStorage.setItem(JOIN_USERNAME_KEY, value);
                }
            }
        });

        dialog.dataset.epJoinDialogInit = '1';
    }

    function watchForJoinDialog() {
        const observer = new MutationObserver(mutations => {
            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    if (!(node instanceof HTMLElement)) continue;
                    if (node.matches('[role="dialog"]')) {
                        tryInitJoinDialog(node);
                    } else {
                        const dialog = node.querySelector('[role="dialog"]');
                        if (dialog) tryInitJoinDialog(dialog);
                    }
                }
            }
        });
        observer.observe(document.documentElement, { childList: true, subtree: true });
        document.querySelectorAll('[role="dialog"]').forEach(tryInitJoinDialog);
    }

    watchForJoinDialog();

    // ─── Utilities ─────────────────────────────────────────────────────────────
    const URL_REGEX = /((https?:\/\/|www\.)[^\s<>"']+)/g;
    const IMAGE_EXT = /\.(jpe?g|png|gif|webp|avif|bmp|svg)(\?.*)?$/i;
    const VIDEO_EXT = /\.(webm|mp4|mov|ogv)(\?.*)?$/i;
    const AUDIO_EXT = /\.(mp3|ogg|m4a|wav|flac|opus)(\?.*)?$/i;
    const YOUTUBE_RE = /(?:youtube\.com\/watch\?.*v=|youtu\.be\/)([\w-]+)/i;
    const TWITTER_RE = /(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/i;
    const TWITTER_PROFILE_RE = /(?:twitter\.com|x\.com)\/([A-Za-z0-9_]{1,15})(?:[/?#].*)?$/i;
    const REDDIT_RE = /(?:reddit\.com\/r\/[^/]+\/comments\/[A-Za-z0-9_]+\/[^\s<>"']*|redd\.it\/[A-Za-z0-9_]+)/i;
    const CATBOX_IMG_RE = /https?:\/\/files\.catbox\.moe\/[^\s<>"']+\.(jpe?g|png|gif|webp)/i;
    const SEVENTV_RE = /https?:\/\/cdn\.7tv\.app\/[^\s<>"']+\.(jpe?g|png|gif|webp|avif)/i;
    const IMGUR_RE = /https?:\/\/(?:i\.)?imgur\.com\/([^\s<>"']+)/i;
    const TENOR_RE = /https?:\/\/(?:www\.)?tenor\.com\/view\/[\w-]+/i;
    const KLIPY_RE = /https?:\/\/(?:www\.)?klipy\.com\/gifs\/[\w-]+/i;
    const CHAN_RE = /https?:\/\/boards\.4chan(?:nel)?\.org\/([a-z0-9]+)\/thread\/(\d+)(?:.*#p(\d+))?/i;
    const TIKTOK_RE = /(?:https?:\/\/)?(?:www\.|vm\.)?tiktok\.com\/(?:@[^/]+\/video\/)?(\d{15,20})/i;
    const FOURCHAN_MEDIA_RE = /https?:\/\/i\.4cdn\.org\/[a-z0-9]+\/\d+\.\w+/i;
    const DISCORD_CDN_RE   = /https?:\/\/(?:cdn|media)\.discordapp\.(?:com|net)\/[^\s<>"']+\.(?:jpe?g|png|gif|webp|avif|mp4|webm)/i;
    // fxtwitter CDN (gif.fxtwitter.com, pbs.fxtwitter.com, video.fxtwitter.com, etc.)
    // MUST be checked before TWITTER_PROFILE_RE because fxtwitter.com contains the substring "twitter.com"
    const FXTWITTER_CDN_RE = /^https?:\/\/(?:[\w-]+\.)?fxtwitter\.com\//i;
    const SPOTIFY_RE = /https?:\/\/open\.spotify\.com\/(track|album|playlist|artist|episode|show)\/([A-Za-z0-9]+)/i;
    const GDOC_RE = /https?:\/\/docs\.google\.com\/(document|spreadsheets|presentation)\/d\/([A-Za-z0-9_-]+)/i;
    const GITHUB_RE = /https?:\/\/github\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)(?:\/(?:issues|pull)\/(\d+))?(?:[/?#][^\s]*)?/i;
    const STEAM_RE = /https?:\/\/store\.steampowered\.com\/app\/(\d+)/i;
    const B4K_RE = /https?:\/\/arch-img\.b4k\.dev\//i;

    function escapeHTML(str) {
        return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    }

    function hashStr(str) {
        let h = 0;
        for (let i = 0; i < str.length; i++) { h = Math.imul(31, h) + str.charCodeAt(i) | 0; }
        return Math.abs(h);
    }


    // ─── Styles ────────────────────────────────────────────────────────────────
    function buildStyles() {
        return `
/* ════════════════════════════════════════════════════
   ENHANCER+ BASE
════════════════════════════════════════════════════ */

/* Settings panel */
#ep-panel {
    position: fixed;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    background: #141414;
    color: #e8e8e8;
    border: 1px solid #2a2a2a;
    box-shadow: 0 8px 32px rgba(0,0,0,0.7);
    padding: 0;
    z-index: 99999;
    width: 520px;
    max-height: 88vh;
    border-radius: 14px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-size: 13px;
}
#ep-panel {
    transition: opacity 0.2s ease, transform 0.2s cubic-bezier(0.34,1.15,0.64,1);
}
#ep-panel.hidden {
    opacity: 0 !important;
    pointer-events: none !important;
    transform: translate(-50%, -47%) scale(0.95) !important;
}

#ep-panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 16px;
    background: color-mix(in srgb, var(--ep-accent, #e05a2b) 16%, rgba(15,15,17,0.98));
    border-bottom: 1px solid rgba(255,255,255,0.07);
    backdrop-filter: blur(18px);
    box-shadow: 0 2px 18px rgba(0,0,0,0.35);
}
#ep-panel-header h2 {
    margin: 0; font-size: 15px; font-weight: 700;
    color: #f4f4f4;
    letter-spacing: 0;
}
#ep-panel-close {
    background: none; border: none; color: #888; cursor: pointer;
    font-size: 18px; line-height: 1; padding: 2px 6px; border-radius: 6px;
    transition: color .15s, background .15s;
}
#ep-panel-close:hover { color: #fff; background: #2a2a2a; }

#ep-tabs {
    display: flex;
    gap: 2px;
    padding: 10px 14px 0;
    background: #1a1a1a;
    border-bottom: 1px solid #252525;
    flex-shrink: 0;
    flex-wrap: wrap;
}
.ep-tab {
    background: none; border: none; color: #888; cursor: pointer;
    padding: 7px 14px; font-size: 12px; font-weight: 600;
    border-radius: 8px 8px 0 0; letter-spacing: 0.04em;
    text-transform: uppercase; transition: color .15s, background .15s;
    border-bottom: 2px solid transparent;
    margin-bottom: -1px;
}
.ep-tab:hover { color: #ccc; background: #252525; }
.ep-tab.active {
    color: var(--ep-accent, #e05a2b); border-bottom-color: var(--ep-accent, #e05a2b);
    background: none;
    text-shadow: 0 0 10px color-mix(in srgb, var(--ep-accent-2, var(--ep-accent)) 40%, transparent);
}

#ep-panel-body {
    overflow-y: auto; overflow-x: hidden;
    padding: 14px 18px;
    flex: 1;
}
#ep-panel-body::-webkit-scrollbar { width: 6px; }
#ep-panel-body::-webkit-scrollbar-track { background: transparent; }
#ep-panel-body::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 3px; }

#ep-panel {
    background: rgba(12,12,14,0.92);
    border: 1px solid rgba(255,255,255,0.05);
    backdrop-filter: blur(18px);
    box-shadow:
        0 0 0 1px rgba(255,255,255,0.03),
        0 18px 50px rgba(0,0,0,0.55);
}

.ep-section { display: none; }
.ep-section.active { display: block; }

.ep-group {
    background: #1c1c1c;
    border: 1px solid #252525;
    border-radius: 10px;
    overflow: hidden;
    margin-bottom: 12px;
}
.ep-group-title {
    font-size: 10px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.08em; color: #666;
    padding: 8px 12px 6px;
    border-bottom: 1px solid #252525;
}

.ep-row {
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    gap: 10px;
    padding: 9px 12px;
    border-bottom: 1px solid #1f1f1f;
    transition: background .1s;
}
.ep-row:last-child { border-bottom: none; }
.ep-row:hover { background: #202020; }

.ep-label { display: flex; flex-direction: column; gap: 2px; }
.ep-label span { font-size: 13px; color: #ddd; }
.ep-label small { font-size: 11px; color: #666; }

.ep-row input[type=text],
.ep-row input[type=number],
.ep-row input[type=url],
.ep-row select {
    background: #111; border: 1px solid #333; color: #e8e8e8;
    border-radius: 6px; padding: 5px 8px; font-size: 12px;
    min-width: 150px; max-width: 200px;
    transition: border-color .15s;
    box-sizing: border-box;
}
.ep-row input[type=text]:focus,
.ep-row input[type=number]:focus,
.ep-row input[type=url]:focus,
.ep-row select:focus {
    outline: none; border-color: var(--ep-accent, #e05a2b);
}

.ep-row input[type=range] {
    width: 150px; accent-color: var(--ep-accent, #e05a2b);
}
.ep-row input[type=color] {
    width: 44px; height: 28px; border: 1px solid #333; border-radius: 6px;
    background: #111; cursor: pointer; padding: 2px;
}

/* Toggle switch */
.ep-toggle {
    position: relative; width: 38px; height: 22px;
    flex-shrink: 0;
}
.ep-toggle input { opacity: 0; width: 0; height: 0; }
.ep-toggle-slider {
    position: absolute; inset: 0; background: #333;
    border-radius: 11px; cursor: pointer; transition: background .2s;
}
.ep-toggle-slider::before {
    content: ''; position: absolute;
    width: 16px; height: 16px;
    left: 3px; top: 3px;
    background: #888; border-radius: 50%;
    transition: transform .2s, background .2s;
}
.ep-toggle input:checked + .ep-toggle-slider { background: var(--ep-accent, #e05a2b); }
.ep-toggle input:checked + .ep-toggle-slider::before { transform: translateX(16px); background: #fff; }

#ep-panel-footer {
    display: flex; align-items: center; justify-content: space-between;
    padding: 10px 18px;
    border-top: 1px solid #252525;
    background: #1a1a1a;
    flex-shrink: 0;
    gap: 8px;
}
.ep-btn {
    background: var(--ep-accent-g, var(--ep-accent, #e05a2b)); color: #fff;
    border: none; border-radius: 7px;
    padding: 7px 16px; font-size: 12px; font-weight: 600;
    cursor: pointer; letter-spacing: 0.03em;
    transition: opacity .15s, transform .1s;
}
.ep-btn:hover { opacity: 0.85; }
.ep-btn:active { transform: scale(0.97); }
.ep-btn.secondary {
    background: #2a2a2a; color: #bbb;
}
.ep-btn.secondary:hover { background: #333; color: #fff; }
.ep-btn.danger { background: #c0392b; }

/* Make MUI accordion/paper panels match the enhancer settings panel background */
.MuiPaper-root.MuiAccordion-root,
.MuiAccordion-root.MuiPaper-root {
    background: rgba(12,12,14,0.92) !important;
    color: #e8e8e8 !important;
    border: 1px solid #2a2a2a !important;
    box-shadow: 0 8px 32px rgba(0,0,0,0.7) !important;
}
.MuiAccordionDetails-root,
.MuiAccordionSummary-root {
    background: transparent !important;
    color: inherit !important;
}

/* Beop floating launcher and top cover. Beop proxies objection.lol's native tabs. */
body.ep-has-beop-bar #root { padding-top: 0 !important; box-sizing: border-box; }
.ep-native-tabbar-hidden {
    opacity: 0 !important;
    pointer-events: none !important;
}
.ep-native-topbar-hidden {
    opacity: 0 !important;
    pointer-events: none !important;
}
#ep-courtroom-bar {
    position: fixed; bottom: 12px; left: 12px; height: 32px;
    z-index: 9991; display: flex; align-items: center; gap: 6px;
    padding: 0 8px; box-sizing: border-box;
    background: color-mix(in srgb, var(--ep-accent, #e05a2b) 14%, rgba(13,13,15,0.97));
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 8px;
    box-shadow: 0 4px 18px rgba(0,0,0,0.4);
    backdrop-filter: blur(14px);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-size: 12px;
}
#ep-courtroom-bar .ep-bar-title { color: #f4f4f4; font-size: 12px; font-weight: 700; letter-spacing: 0; white-space: nowrap; }
#ep-courtroom-bar .ep-bar-meta { color: rgba(255,255,255,0.45); font-size: 11px; white-space: nowrap; }
#ep-native-tabs {
    display: inline-flex; align-items: center; gap: 2px;
    padding-left: 5px; margin-left: 2px; border-left: 1px solid rgba(255,255,255,0.1);
}
.ep-native-tab,
#ep-tab-trigger-btn,
#ep-trigger-btn {
    display: inline-flex; align-items: center; justify-content: center;
    background: rgba(255,255,255,0.08); color: #fff; border: 1px solid rgba(255,255,255,0.12);
    border-radius: 4px; padding: 2px 8px; font-size: 11px; font-weight: 600; cursor: pointer;
    line-height: 1.4; white-space: nowrap; height: 24px;
    transition: background .15s, border-color .15s;
}
#ep-trigger-btn {
    font-size: 11px; line-height: 1; padding: 3px 7px;
    min-width: 24px;
}
.ep-native-tab:hover,
#ep-tab-trigger-btn:hover,
#ep-trigger-btn:hover { background: rgba(255,255,255,0.14); border-color: rgba(255,255,255,0.2); }
.ep-native-tab.active {
    background: var(--ep-accent-g, var(--ep-accent, #e05a2b));
    border-color: var(--ep-accent, #e05a2b);
}
#ep-top-cover {
    position: fixed; top: 0; left: 0; right: 0; height: 46px; z-index: 9992;
    display: flex; align-items: center; justify-content: space-between; gap: 12px;
    pointer-events: auto;
    padding: 0 16px; box-sizing: border-box;
    background: color-mix(in srgb, var(--ep-accent, #e05a2b) 18%, rgba(13,13,15,0.96));
    border-bottom: 1px solid rgba(255,255,255,0.08);
    box-shadow: 0 8px 24px rgba(0,0,0,0.18);
    color: rgba(255,255,255,0.88) !important; font-size: 13px; font-weight: 700;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}
#ep-top-cover strong { color: #fff !important; }
#ep-top-cover span { color: rgba(255,255,255,0.66) !important; font-weight: 600; }
#ep-top-cover .ep-top-left,
#ep-top-cover .ep-top-right {
    display: flex; align-items: center; gap: 10px;
}
.MuiDialog-container .MuiAppBar-root.MuiAppBar-colorInfo {
    background: color-mix(in srgb, var(--ep-accent, #e05a2b) 18%, rgba(13,13,15,0.96)) !important;
    border-bottom: 1px solid rgba(255,255,255,0.08) !important;
    box-shadow: 0 8px 24px rgba(0,0,0,0.18) !important;
}
.MuiDialog-container .MuiAppBar-root.MuiAppBar-colorInfo .MuiTypography-root.MuiTypography-h6 {
    font-size: 13px !important;
    font-weight: 700 !important;
}
.MuiDialog-container header.MuiAppBar-root .MuiButton-root.MuiButton-text {
    min-width: 28px !important;
    width: 28px !important;
    height: 28px !important;
    padding: 0 !important;
    border-radius: 8px !important;
    background: rgba(255,255,255,0.08) !important;
    color: transparent !important;
    font-size: 0 !important;
    line-height: 0 !important;
    position: relative !important;
    transition: background .18s ease, transform .18s ease;
}
.MuiDialog-container header.MuiAppBar-root .MuiButton-root.MuiButton-text:has(.MuiButton-icon),
.MuiDialog-container header.MuiAppBar-root .MuiButton-root.MuiButton-text:has(svg) {
    color: #fff !important;
    font-size: 0 !important;
    line-height: 0 !important;
    width: 28px !important;
    min-width: 28px !important;
    padding: 0 !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
}
.MuiDialog-container header.MuiAppBar-root .MuiButton-root.MuiButton-text:has(.MuiButton-icon) {
    color: transparent !important;
}
.MuiDialog-container header.MuiAppBar-root .MuiButton-root.MuiButton-text:has(.MuiButton-icon) svg,
.MuiDialog-container header.MuiAppBar-root .MuiButton-root.MuiButton-text:has(.MuiButton-icon) .MuiButton-icon {
    color: #fff !important;
    fill: #fff !important;
    width: 18px !important;
    height: 18px !important;
}
.MuiDialog-container header.MuiAppBar-root .MuiButton-root.MuiButton-text:has(.MuiButton-icon) .MuiButton-icon,
.MuiDialog-container header.MuiAppBar-root .MuiButton-root.MuiButton-text:has(.MuiButton-icon) svg {
    margin-right: 0 !important;
}
.MuiDialog-container header.MuiAppBar-root .MuiButton-root.MuiButton-text + .MuiButton-root.MuiButton-text {
    margin-left: 8px !important;
}
.MuiDialog-container header.MuiAppBar-root .MuiButton-root.MuiButton-text:has(.MuiButton-icon)::before,
.MuiDialog-container header.MuiAppBar-root .MuiButton-root.MuiButton-text:has(svg)::before {
    content: none !important;
}
.MuiDialog-container header.MuiAppBar-root .MuiButton-root.MuiButton-text:hover {
    background: rgba(255,255,255,0.16) !important;
    transform: translateY(-1px) !important;
}
.MuiDialog-container header.MuiAppBar-root .MuiButton-root.MuiButton-text:not(:has(.MuiButton-icon)):not(:has(svg))::before {
    content: "✕" !important;
    position: absolute !important;
    inset: 0 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    font-size: 14px !important;
    color: #fff !important;
    pointer-events: none !important;
}
.MuiDialog-container header.MuiAppBar-root .MuiButton-root.MuiButton-text .MuiTouchRipple-root {
    display: none !important;
}
#ep-clock {
    display: inline-flex;
    align-items: center;
    white-space: nowrap;
}
#ep-clock:empty {
    display: none;
}
.ep-top-btn {
    display: inline-grid; place-items: center; min-width: 34px; height: 28px;
    border: 1px solid rgba(255,255,255,0.12); border-radius: 7px;
    background: rgba(255,255,255,0.08); color: #fff !important;
    font-size: 12px; font-weight: 700; cursor: pointer;
}
.ep-top-btn:hover { background: rgba(255,255,255,0.14); border-color: rgba(255,255,255,0.2); }
#ep-top-bar-img {
    height: 30px; width: auto; max-width: 120px;
    object-fit: contain; border-radius: 5px;
    opacity: 0.92; flex-shrink: 0;
}


/* ═══ HOVER EMBED CONTAINER ═══ */
#ep-hover {
    position: fixed;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    z-index: 99998;
    pointer-events: none;
    max-width: 72vw;
    display: flex; flex-direction: column; align-items: center;
}
#ep-hover.audio-hover { pointer-events: unset; }
#ep-hover-header {
    position: absolute; right: 0; top: -28px;
    display: flex; gap: 2px;
}
#ep-hover-header button {
    all: unset; width: 28px; height: 24px;
    display: inline-grid; place-items: center;
    color: #fff; background: #222a33;
    border-radius: 4px; cursor: pointer;
    transition: background .12s, transform .08s;
    font-size: 13px;
}
#ep-hover-header button:hover { background: #3a4a5a; }
#ep-hover-header button:active { transform: scale(0.93); }
#ep-hover > img, #ep-hover > video, #ep-hover > audio, #ep-hover > iframe {
    max-width: 72vw; max-height: 78vh;
    border-radius: 8px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.6);
}
.ep-embed-grid {
    display: flex; flex-direction: row; gap: 4px;
    max-height: 52vh; width: 100%;
    justify-content: center; align-items: stretch; overflow: hidden;
}
.ep-embed-grid img, .ep-embed-grid video {
    flex: 1 1 0; max-height: 52vh; object-fit: contain; width: auto;
    border-radius: 6px;
}
.ep-embed-text {
    background: #1a1a1a; color: #ddd;
    padding: 8px 14px; border-radius: 6px;
    text-align: center; width: 100%; word-break: break-word;
    font-size: 13px;
}

/* ═══ CHAT UI RESKIN ═══ */
.ep-chat-reskin {
    --ep-chat-bg: rgba(14,14,16,calc(var(--ep-opacity,0.97)));
    --ep-chat-border: #222;
    --ep-chat-msg-hover: rgba(255,255,255,0.03);
    --ep-chat-separator: rgba(255,255,255,0.04);
    --ep-user-color: var(--ep-accent,#e05a2b);
}

/* Chat message link styling */
.ep-link {
    color: #5ab4ff; text-decoration: none;
    transition: color .12s;
}
.ep-link:hover { color: #8fcfff; text-decoration: underline; }
.ep-link:visited { color: #b47dff; }

/* Highlight mark */
mark.ep-highlight {
    background: rgba(224,90,43,0.28);
    color: #ffb89a;
    border-radius: 3px; padding: 0 2px;
}

/* Mention highlight */
mark.ep-mention {
    background: rgba(43,158,224,0.25);
    color: #7dd4ff;
    border-radius: 3px; padding: 0 2px;
}

/* Chat message wrapper (injected elements) */
.ep-msg-meta {
    display: flex; align-items: baseline; gap: 5px;
    flex-wrap: wrap;
}
.ep-msg-actions {
    display: none; gap: 3px; align-items: center; margin-left: auto;
}
li:hover .ep-msg-actions { display: flex; }

.ep-msg-btn {
    background: #1f1f1f; border: 1px solid #2a2a2a;
    color: #888; border-radius: 4px; cursor: pointer;
    font-size: 10px; padding: 1px 5px; line-height: 1.6;
    transition: color .12s, background .12s;
}
.ep-msg-btn:hover { background: #2a2a2a; color: #ccc; }

/* Inline media in chat */
.ep-inline-img {
    display: block; max-width: 240px; max-height: 140px; object-fit: contain;
    border-radius: 6px; margin-top: 4px; cursor: zoom-in; border: 1px solid #222; transition: opacity .15s;
}
.ep-inline-img:hover { opacity: 0.85; }
.ep-inline-youtube {
    display: block; width: min(360px, 100%); aspect-ratio: 16 / 9; height: auto;
    margin-top: 6px; border: 1px solid rgba(255,255,255,0.08); border-radius: 7px; background: #0b0b0c;
}
.ep-inline-tweet {
    margin-top: 6px; width: min(360px, 100%); border: 1px solid rgba(255,255,255,0.08);
    border-radius: 7px; background: rgba(20,20,24,0.88); overflow: hidden;
}
.ep-tweet-card { padding: 9px 10px; color: #d8d8d8; font-size: 12px; line-height: 1.35; }
.ep-tweet-user { color: #68b8ff; font-weight: 700; margin-bottom: 4px; }
.ep-tweet-media { display: grid; gap: 4px; margin-top: 7px; }
.ep-tweet-media img, .ep-tweet-media video { max-width: 100%; max-height: 180px; object-fit: contain; border-radius: 5px; background: #050505; }
.ep-reddit-card {
    margin-top: 6px; width: min(360px, 100%); border: 1px solid rgba(255,255,255,0.08);
    border-radius: 7px; background: rgba(24,20,18,0.88); padding: 9px 10px;
    color: #d8d8d8; font-size: 12px; line-height: 1.35;
}
.ep-reddit-title { color: #ff9b6b; font-weight: 700; margin-bottom: 4px; }
/* Host status pills */
#ep-host-status {
    display: none; align-items: center; gap: 5px; margin-left: 10px;
}
#ep-host-status.visible { display: flex; }
.ep-host-pill {
    display: inline-flex; align-items: center; gap: 4px;
    background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.08);
    border-radius: 999px; padding: 2px 8px 2px 5px;
    font-size: 10px; font-weight: 600; letter-spacing: 0.02em;
    color: rgba(255,255,255,0.45); transition: color .25s;
}
.ep-host-pill.up { color: rgba(255,255,255,0.75); }
.ep-host-dot {
    width: 6px; height: 6px; border-radius: 50%; background: #444;
    flex-shrink: 0; transition: background .3s, box-shadow .3s;
}
.ep-host-pill.up   .ep-host-dot { background: #38c172; box-shadow: 0 0 5px rgba(56,193,114,0.55); }
.ep-host-pill.down .ep-host-dot { background: #ff5f56; box-shadow: 0 0 5px rgba(255,95,86,0.45); }
.ep-host-pill.checking .ep-host-dot { background: #888; animation: ep-dot-pulse 1.2s ease-in-out infinite; }
@keyframes ep-dot-pulse { 0%,100%{opacity:1} 50%{opacity:0.25} }
#ep-reply-bar {
    display: flex; align-items: center; gap: 8px; justify-content: space-between;
    padding: 0 10px; background: rgba(255,255,255,0.05);
    border-left: 2px solid var(--ep-accent, #e05a2b);
    border-radius: 0 4px 4px 0; font-size: 11px; color: #aaa;
    margin: 0; flex-shrink: 0;
    max-height: 0; overflow: hidden; opacity: 0;
    transition: max-height 0.22s ease, opacity 0.18s ease, margin 0.2s ease, padding 0.2s ease;
}
#ep-reply-bar.visible { max-height: 44px; opacity: 1; margin: 4px 0 2px; padding: 5px 10px; }
#ep-reply-bar strong { color: #e0c0b0; }
#ep-reply-bar .ep-reply-cancel {
    background: none; border: none; color: #666; cursor: pointer; font-size: 13px; padding: 0 2px;
}
#ep-reply-bar .ep-reply-cancel:hover { color: #ccc; }
.ep-reply-quote {
    display: block; margin-bottom: 3px;
    padding: 3px 7px; background: rgba(255,255,255,0.04);
    border-left: 2px solid var(--ep-accent, #e05a2b);
    border-radius: 0 3px 3px 0; font-size: 11px; color: #888;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 95%;
}
.ep-reply-quote strong { color: #bbb; }
.ep-msg-btn.ep-reply-btn { display: none; }
body.ep-threading .ep-msg-btn.ep-reply-btn { display: inline-flex; }
/* -- Accent swatches -- */
.ep-swatch-row .ep-swatches { display: flex; gap: 5px; flex-wrap: wrap; }
.ep-swatch {
    width: 20px; height: 20px; border-radius: 50%; border: 2px solid transparent;
    cursor: pointer; flex-shrink: 0;
    transition: transform 0.15s, border-color 0.15s, box-shadow 0.15s;
    box-shadow: 0 1px 4px rgba(0,0,0,0.4);
}
.ep-swatch:hover { transform: scale(1.18); border-color: rgba(255,255,255,0.35); }
.ep-swatch:active { transform: scale(0.9); }
.ep-swatch.selected { border-color: #fff; box-shadow: 0 0 0 3px rgba(255,255,255,0.15); }
/* -- Message enter animation -- */
@keyframes ep-msg-enter {
    from { opacity: 0; transform: translateX(14px); }
    to   { opacity: 1; transform: translateX(0); }
}
.ep-chat-msg.ep-msg-entering {
    animation: ep-msg-enter 0.22s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
}
/* -- Filtered-out messages -- */
.ep-chat-msg.ep-filtered-out { display: none !important; }
/* -- Filter bar -- */
#ep-chat-filter-bar {
    display: flex; align-items: center; gap: 4px; flex-wrap: wrap;
    padding: 5px 8px 4px; flex-shrink: 0;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    background: rgba(0,0,0,0.18);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}
.ep-filter-chip {
    padding: 2px 9px; border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.04); color: #777; font-size: 10px;
    cursor: pointer; white-space: nowrap; user-select: none;
    transition: background 0.15s, color 0.15s, border-color 0.15s, transform 0.1s;
    font-family: inherit;
}
.ep-filter-chip:hover { background: rgba(255,255,255,0.09); color: #bbb; transform: translateY(-1px); }
.ep-filter-chip.active {
    background: var(--ep-accent-g, var(--ep-accent, #e05a2b)); color: #fff;
    border-color: var(--ep-accent, #e05a2b);
}
.ep-filter-chip:active { transform: scale(0.91); }
#ep-filter-user-input {
    padding: 2px 7px; border-radius: 8px;
    border: 1px solid rgba(255,255,255,0.12);
    background: rgba(255,255,255,0.06); color: #ccc; font-size: 10px;
    outline: none; width: 86px;
    transition: border-color 0.15s, background 0.15s, width 0.2s ease;
    font-family: inherit;
}
#ep-filter-user-input:focus { border-color: var(--ep-accent, #e05a2b); background: rgba(255,255,255,0.09); width: 110px; }
#ep-filter-user-input::placeholder { color: #3d3d3d; }
#ep-filter-count { margin-left: auto; font-size: 10px; color: #444; transition: color 0.2s; }
#ep-filter-count.active { color: var(--ep-accent, #e05a2b); }
/* -- Settings panel section fade -- */
.ep-section { transition: opacity 0.15s ease; }
.ep-section:not(.active) { opacity: 0; pointer-events: none; }
.ep-section.active { opacity: 1; }
/* -- Message action buttons -- */
.ep-msg-btn { transition: opacity 0.1s, transform 0.1s, background 0.12s, color 0.12s; }
.ep-msg-btn:active { transform: scale(0.84) !important; }
/* -- Control bar buttons -- */
.ep-native-tab { transition: color 0.15s, background 0.15s, border-color 0.15s, transform 0.1s; }
.ep-native-tab:active { transform: scale(0.93); }
/* -- Toast enter/leave -- */
@keyframes ep-toast-in  { from { opacity:0; transform:translateX(24px) scale(0.92); } to { opacity:1; transform:translateX(0) scale(1); } }
@keyframes ep-toast-out { from { opacity:1; transform:translateX(0) scale(1); } to { opacity:0; transform:translateX(24px) scale(0.92); } }
.ep-toast.ep-toast-entering { animation: ep-toast-in 0.22s cubic-bezier(0.34,1.2,0.64,1) forwards; }
.ep-toast.ep-toast-leaving  { animation: ep-toast-out 0.22s ease-in forwards; }
.ep-msg-context {
    display: block; width: max-content; max-width: 100%; margin: 0 0 2px; padding: 1px 5px;
    border-radius: 5px; background: rgba(255,255,255,0.045); color: #777; font-size: 10px; line-height: 1.5;
}

/* Blocked message */
body.ep-hide-ctx .ep-msg-context { display: none !important; }

@keyframes ep-block-flash {
    0%   { background: rgba(192,57,43,0.0); }
    30%  { background: rgba(192,57,43,0.25); }
    100% { background: rgba(192,57,43,0.0); }
}
.ep-blocked {
    opacity: 0.35;
    animation: ep-block-flash 0.55s ease forwards;
}
.ep-blocked .ep-blocked-badge {
    display: inline-flex !important; align-items: center; gap: 5px;
    font-size: 10px; color: #c0392b; font-style: normal;
    padding: 2px 7px; border-radius: 8px;
    background: rgba(192,57,43,0.1); border: 1px solid rgba(192,57,43,0.25);
    cursor: pointer; transition: background 0.15s; user-select: none;
}
.ep-blocked .ep-blocked-badge:hover { background: rgba(192,57,43,0.22); }
.ep-blocked > *:not(.ep-blocked-badge):not(.ep-msg-actions) { display: none !important; }
.ep-blocked .ep-msg-actions { display: none !important; }

/* Status bar (hidden — stats moved into #ep-top-cover) */
#ep-statusbar { display: none !important; }
/* Inline stats inside the top cover */
#ep-top-cover .ep-top-stat {
    font-size: 11px; font-family: monospace;
    color: rgba(255,255,255,0.52) !important; white-space: nowrap;
    letter-spacing: 0.02em; user-select: none;
}
#ep-top-cover .ep-top-stat span { color: var(--ep-accent, #e05a2b) !important; }
.MuiDialog-container .MuiPaper-root.MuiAppBar-root.MuiAppBar-colorInfo {
    background: color-mix(in srgb, var(--ep-accent, #e05a2b) 18%, rgba(13,13,15,0.96)) !important;
    border-bottom: 1px solid rgba(255,255,255,0.08) !important;
    box-shadow: 0 8px 24px rgba(0,0,0,0.18) !important;
}

/* Auto-scroll paused indicator */
#ep-scroll-paused {
    position: fixed;
    bottom: 50px; right: 14px;
    background: rgba(224,90,43,0.9);
    color: #fff; border-radius: 8px;
    padding: 6px 14px; font-size: 12px; font-weight: 600;
    z-index: 9990; cursor: pointer;
    display: none;
    backdrop-filter: blur(4px);
    box-shadow: 0 4px 16px rgba(224,90,43,0.4);
    transition: opacity .2s;
}
#ep-scroll-paused:hover { opacity: 0.8; }

/* ── Frame popup: image share overlay on courtroom scene ── */
.ep-frame-popup {
    position: fixed;
    z-index: 9994;
    pointer-events: none;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 10px 36px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.07);
    background: transparent;
    /* width/max-width/max-height set dynamically in JS based on scene size */
    animation: ep-frame-pop 0.25s cubic-bezier(0.34,1.46,0.64,1) forwards;
}
@keyframes ep-frame-pop {
    from { opacity: 0; transform: translateY(12px) scale(0.88); }
    to   { opacity: 1; transform: translateY(0)   scale(1);    }
}
@keyframes ep-frame-out {
    from { opacity: 1; transform: translateY(0) scale(1); }
    to   { opacity: 0; transform: translateY(18px) scale(0.84); }
}
.ep-frame-popup.ep-frame-out {
    animation: ep-frame-out 0.55s cubic-bezier(0.4, 0, 1, 1) forwards;
}
.ep-frame-popup-name {
    padding: 5px 9px 4px;
    font-size: 11px;
    font-weight: 800;
    font-family: "Inter", system-ui, sans-serif;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: rgba(0,0,0,0.82);
    background: var(--ep-frame-color, #e05a2b);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
}
.ep-frame-popup-name-text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
    min-width: 0;
}
.ep-frame-popup-timer {
    font-size: 10px;
    font-weight: 700;
    font-family: "Inter", system-ui, monospace;
    color: rgba(0,0,0,0.55);
    background: rgba(0,0,0,0.12);
    border-radius: 4px;
    padding: 1px 5px;
    flex-shrink: 0;
    letter-spacing: 0.03em;
    min-width: 22px;
    text-align: center;
}
.ep-frame-popup img {
    display: block;
    /* max-width / max-height injected inline so they respond to scene size */
    width: 100%;
    height: auto;
    object-fit: contain;
    background: transparent;
}

/* Mention toast */
#ep-mention-toast {
    position: fixed;
    top: 18px; right: 18px;
    background: linear-gradient(135deg, #1a2633, #111);
    border: 1px solid #2b5ae0;
    border-left: 4px solid #2b5ae0;
    color: #ddd; border-radius: 10px;
    padding: 10px 16px; font-size: 13px;
    z-index: 99997;
    max-width: 320px;
    box-shadow: 0 6px 24px rgba(0,0,0,0.5);
    display: none;
    animation: ep-slide-in 0.25s ease;
}
@keyframes ep-slide-in {
    from { transform: translateX(40px); opacity: 0; }
    to   { transform: translateX(0);    opacity: 1; }
}

/* Search overlay */
#ep-search-overlay {
    position: fixed;
    top: 12px; left: 50%;
    transform: translateX(-50%);
    background: #141414;
    border: 1px solid #2a2a2a;
    border-radius: 10px;
    padding: 8px 12px;
    display: none; align-items: center; gap: 8px;
    z-index: 99996;
    box-shadow: 0 6px 24px rgba(0,0,0,0.5);
}
#ep-search-overlay.visible { display: flex; }
#ep-search-input {
    background: #111; border: 1px solid #333; color: #e8e8e8;
    border-radius: 6px; padding: 5px 10px; font-size: 13px; width: 220px;
}
#ep-search-input:focus { outline: none; border-color: var(--ep-accent, #e05a2b); }
#ep-search-count { font-size: 11px; color: #666; min-width: 40px; }
.ep-search-match { background: rgba(224,90,43,0.3); border-radius: 2px; }

/* Evidence fix */
#ep-evidence-fix img[alt="Evidence"] { object-fit: contain !important; }

/* Custom Background */
#ep-bg {
    display: none; position: fixed; inset: 0; z-index: 0;
    pointer-events: none;
    background-size: cover; background-position: center; background-repeat: no-repeat;
    transition: opacity .4s;
}
#ep-bg.active { display: block; }
#ep-bg-dim {
    display: none; position: fixed; inset: 0; z-index: 0;
    pointer-events: none; background: rgba(0,0,0,1);
    transition: opacity .4s;
}
#ep-bg-dim.active { display: block; }
body.ep-has-bg > #root { position: relative; z-index: 1; }

/* Clock */
#ep-clock {
    font-size: 11px; font-family: monospace;
    color: rgba(255,255,255,0.72); min-width: 52px;
    text-align: right; letter-spacing: 0.03em; user-select: none;
}

/* Now Playing */
#ep-now-playing {
    display: none; align-items: center; gap: 8px; padding: 5px 12px;
    background: transparent;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    font-size: 12px; color: rgba(255,255,255,0.88); max-width: 280px;
    animation: ep-slide-in 0.25s ease;
}
#ep-now-playing.visible { display: flex; }
#ep-now-playing.ep-now-playing-integrated {
    max-width: none;
    padding: 0;
    border-radius: 0;
    white-space: normal;
}
#ep-now-playing-icon { font-size: 14px; flex-shrink: 0; animation: ep-np-pulse 1.4s ease-in-out infinite; }
@keyframes ep-np-pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
#ep-now-playing-text { white-space: normal; flex: 1; word-break: break-word; }
#ep-now-playing-label { font-size: 9px; text-transform: uppercase; letter-spacing: 0.07em; color: var(--ep-accent,#e05a2b); font-weight: 700; display: block; margin-bottom: 1px; }
#ep-now-playing-title { font-size: 12px; font-weight: 600; color: #f0f0f0; display: block; }

/* ─── GIF PICKER ─────────────────────────────────────────────────────────── */
.ep-gif-btn {
    display: inline-flex; align-items: center; justify-content: center;
    background: transparent; border: 1px solid rgba(255,255,255,0.16);
    border-radius: 5px; padding: 2px 7px; color: #666;
    font-size: 10px; font-weight: 800; letter-spacing: 0.08em;
    cursor: pointer; flex-shrink: 0; height: 24px; box-sizing: border-box;
    transition: background .15s, color .15s, border-color .15s;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    user-select: none; vertical-align: middle;
}
.ep-gif-btn:hover { background: rgba(255,255,255,0.08); color: #bbb; border-color: rgba(255,255,255,0.28); }
.ep-gif-btn.active { background: rgba(224,90,43,0.12); color: var(--ep-accent,#e05a2b); border-color: rgba(224,90,43,0.45); }

#ep-gif-picker {
    position: fixed; z-index: 99995;
    background: #111113;
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 14px;
    box-shadow: 0 24px 64px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.025);
    width: 380px; max-height: 500px;
    display: flex; flex-direction: column; overflow: hidden;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}
#ep-gif-picker.hidden { display: none !important; }

#ep-gif-header {
    padding: 10px 10px 8px; flex-shrink: 0;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    display: flex; align-items: center; gap: 6px;
}
#ep-gif-search {
    flex: 1; min-width: 0;
    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08);
    color: #ddd; border-radius: 8px;
    padding: 6px 10px; font-size: 12px;
    transition: border-color .15s, background .15s;
}
#ep-gif-search:focus { outline: none; border-color: rgba(224,90,43,0.45); background: rgba(255,255,255,0.07); }
#ep-gif-search::placeholder { color: #3d3d3d; }

#ep-gif-grid {
    overflow-y: auto; overflow-x: hidden;
    padding: 8px 8px 6px;
    columns: 2; column-gap: 5px;
    flex: 1;
}
#ep-gif-grid::-webkit-scrollbar { width: 3px; }
#ep-gif-grid::-webkit-scrollbar-track { background: transparent; }
#ep-gif-grid::-webkit-scrollbar-thumb { background: #252525; border-radius: 2px; }

.ep-gif-item {
    break-inside: avoid; display: block;
    overflow: hidden; border-radius: 7px; cursor: pointer;
    background: #0d0d0f; margin-bottom: 5px;
    transition: opacity .1s, transform .1s;
    border: 1px solid rgba(255,255,255,0.035);
    position: relative;
}
.ep-gif-item:hover { opacity: 0.78; transform: scale(1.025); }
.ep-gif-item img { width: 100%; height: auto; display: block; }

.ep-gif-empty {
    column-span: all; text-align: center;
    color: #333; font-size: 12px; padding: 44px 0;
}

/* GIF Picker tabs */
#ep-gif-tabs {
    display: flex; gap: 4px;
    padding: 0 10px 8px;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    flex-shrink: 0;
}
.ep-gif-tab {
    background: none; border: none; color: #555;
    cursor: pointer; font-size: 10px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.06em;
    padding: 4px 10px; border-radius: 5px;
    transition: color .15s, background .15s;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}
.ep-gif-tab:hover { color: #aaa; background: rgba(255,255,255,0.05); }
.ep-gif-tab.active { color: var(--ep-accent, #e05a2b); background: rgba(224,90,43,0.1); }

/* Fav star overlay on gif items */
.ep-gif-fav-btn {
    position: absolute; top: 4px; right: 4px;
    width: 22px; height: 22px;
    display: flex; align-items: center; justify-content: center;
    background: rgba(0,0,0,0.55); border: none; border-radius: 5px;
    cursor: pointer; font-size: 13px; line-height: 1;
    opacity: 0; transition: opacity .15s, background .15s, transform .1s;
    color: #888; backdrop-filter: blur(4px);
}
.ep-gif-item:hover .ep-gif-fav-btn { opacity: 1; }
.ep-gif-fav-btn.saved { opacity: 1 !important; color: #f5c518; }
.ep-gif-fav-btn:hover { background: rgba(0,0,0,0.8); transform: scale(1.1); }
.ep-gif-fav-btn.saved:hover { color: #e05a2b; }

/* ─── Active frame text box — per-character bounce animation ─── */
@keyframes ep-char-jump {
    0%   { transform: translateY(0)    scale(1); }
    30%  { transform: translateY(-7px) scale(1.06); }
    55%  { transform: translateY(-2px) scale(0.98); }
    75%  { transform: translateY(-4px) scale(1.02); }
    100% { transform: translateY(0)    scale(1); }
}
.ep-char-bounce {
    display: inline-block;
    animation: ep-char-jump 0.34s cubic-bezier(0.34, 1.56, 0.64, 1) both;
    will-change: transform;
}

/* ─── Chat: prevent double scrollbars ─── */
.MuiGrid2-root:nth-child(2),
.MuiDrawer-paper {
    overflow-x: hidden !important;
}
.MuiGrid2-root:nth-child(2) ul,
.MuiDrawer-paper ul {
    overflow-x: hidden !important;
    overflow-y: visible !important;
}
/* Bubble style: prevent horizontal overflow that triggers a second scrollbar */
.MuiGrid2-root:nth-child(2) ul > li,
.MuiDrawer-paper ul > li {
    overflow-x: hidden !important;
    max-width: 100% !important;
    box-sizing: border-box !important;
}

/* ═══ RADIO WIDGET ═══ */
#ep-radio-btn {
    position: fixed;
    bottom: 12px; right: 14px;
    z-index: 9992;
    display: inline-flex; align-items: center; gap: 6px;
    background: color-mix(in srgb, var(--ep-accent, #e05a2b) 18%, rgba(13,13,15,0.97));
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 8px;
    padding: 5px 11px;
    font-size: 11px; font-weight: 700;
    color: #fff; cursor: pointer;
    backdrop-filter: blur(14px);
    box-shadow: 0 4px 18px rgba(0,0,0,0.4);
    transition: background .15s, border-color .15s;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    letter-spacing: 0.03em;
}
#ep-radio-btn:hover {
    background: color-mix(in srgb, var(--ep-accent, #e05a2b) 30%, rgba(13,13,15,0.97));
    border-color: rgba(255,255,255,0.2);
}
#ep-radio-btn.active {
    background: color-mix(in srgb, var(--ep-accent, #e05a2b) 42%, rgba(13,13,15,0.97));
    border-color: rgba(255,255,255,0.22);
}
#ep-radio-panel {
    position: fixed;
    bottom: 52px; right: 14px;
    z-index: 9991;
    width: 290px; height: 200px;
    border-radius: 10px;
    overflow: hidden;
    border: 1px solid rgba(255,255,255,0.1);
    box-shadow: 0 8px 36px rgba(0,0,0,0.65);
    background: #0c0c0e;
}
#ep-radio-panel.hidden { display: none; }
#ep-radio-close {
    position: absolute;
    top: 4px; right: 4px;
    z-index: 2;
    background: rgba(0,0,0,0.55); border: 1px solid rgba(255,255,255,0.1);
    color: #aaa; cursor: pointer;
    font-size: 11px; line-height: 1; padding: 2px 5px; border-radius: 4px;
    transition: color .15s, background .15s;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}
#ep-radio-close:hover { color: #fff; background: rgba(0,0,0,0.8); }
#ep-radio-iframe-wrap {
    position: absolute;
    inset: 0;
    overflow: hidden;
}
#ep-radio-iframe {
    border: none;
    width: 290px;
    height: 900px;
    transform: translateY(-470px);
    transform-origin: 0 0;
    background: #0c0c0e;
}
`;
    }

    function getChatFontSettings() {
        const fontSize = settings.chatFontSize || 13;
        const fontFamilyMap = {
            'system': '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            'inter': '"Inter", sans-serif',
            'roboto': '"Roboto", sans-serif',
            'noto': '"Noto Sans", sans-serif',
            'jetbrains': '"JetBrains Mono", monospace',
            'comic': '"Comic Sans MS", "Chalkboard SE", cursive',
            'courier': '"Courier New", Courier, monospace',
            'georgia': 'Georgia, "Times New Roman", serif',
            'custom': settings.chatFontCustomUrl ? '"BeopCustomFont", sans-serif' : '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        };
        const fontChoice = settings.chatFont || 'system';
        const fontFamily = fontFamilyMap[fontChoice] || fontFamilyMap['system'];
        const googleFontMap = {
            'inter': 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap',
            'roboto': 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap',
            'noto': 'https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;600;700&display=swap',
            'jetbrains': 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&display=swap',
        };
        let fontImport = "@import url('https://fonts.googleapis.com/css2?family=Inter:wght@600;700&display=swap');\n";
        if (fontChoice === 'custom' && settings.chatFontCustomUrl) {
            fontImport += `@font-face { font-family: "BeopCustomFont"; src: url("${settings.chatFontCustomUrl.replace(/"/g, '')}"); }\n`;
        } else if (googleFontMap[fontChoice]) {
            fontImport += `@import url('${googleFontMap[fontChoice]}');\n`;
        }
        return { fontSize, fontFamily, fontImport };
    }

    function applyChatFonts() {
        document.querySelectorAll('.ep-chat-msg').forEach(el => el.classList.remove('ep-chat-msg'));
        if (!settings.chatReskin) return;

        const chatList = findChatList();
        if (chatList) {
            if (!chatList.id) chatList.id = 'ep-chat-list';
            chatList.querySelectorAll(':scope > li').forEach(li => li.classList.add('ep-chat-msg'));
        }
    }

    function tagStaticFontZones() {
        document.querySelectorAll('[data-ep-static-font]').forEach(el => el.removeAttribute('data-ep-static-font'));

        const scope = findMessageComposerScope();
        if (scope) {
            scope.querySelectorAll('.MuiToggleButton-root, .MuiToggleButtonGroup-root').forEach(el => {
                el.dataset.epStaticFont = '1';
            });
        }

        const scene = getSceneContainer();
        if (!scene) return;
        const classPatterns = /textbox|text-box|speech|dialogue|testimony|message-text|bubble-text|line-text/i;
        for (const el of scene.querySelectorAll('[class], [id]')) {
            if (!(el instanceof HTMLElement)) continue;
            if (!classPatterns.test(`${el.className} ${el.id}`)) continue;
            if (el.closest('ul, #ep-chat-list, .MuiInputBase-root, textarea, .ep-composer-textentry, [role="tablist"]')) continue;
            el.dataset.epStaticFont = '1';
        }
    }

    function applyReskinCSS() {
        const id = 'ep-reskin-dynamic';
        let el = document.getElementById(id);
        if (!el) { el = document.createElement('style'); el.id = id; document.head.appendChild(el); }
        if (!settings.chatReskin) {
            el.textContent = '';
            applyChatFonts();
            return;
        }

        const acc  = settings.chatAccentColor  || '#e05a2b';
        const acc2 = settings.chatAccentColor2 || '';
        const accG = acc2 ? `linear-gradient(135deg, ${acc}, ${acc2})` : acc;
        const opacity  = settings.chatOpacity  ?? 0.97;
        const chatBlur = settings.chatBlur     ?? 14;
        const { fontSize, fontFamily, fontImport } = getChatFontSettings();
        const bubbleStyle  = settings.messageBubbleStyle || 'flat';
        const showCtx      = settings.showMsgContext !== false;
        const accentGlow   = settings.accentGlow !== false;
        const selfName     = (settings.myUsername || '').trim().toLowerCase();
        const selfHL       = settings.selfHighlight !== false;
        const timestamps   = settings.showTimestamps || false;

        el.textContent = `${fontImport}
:root {
    --ep-accent:   ${acc};
    --ep-accent-2: ${acc2 || acc};
    --ep-accent-g: ${accG};
    --ep-opacity: ${opacity};
    --ep-chat-font-size: ${fontSize}px;
    --ep-chat-font-family: ${fontFamily};
}

/* ── Sidebar / chat panel ── */
.MuiDrawer-paper,
.MuiGrid2-root:nth-child(2) .MuiStack-root {
    background: rgba(13,13,15,${opacity}) !important;
    backdrop-filter: blur(${chatBlur}px) !important;
    border-left: 1px solid #1e1e1e !important;
}

/* Chat list */
.MuiGrid2-root:nth-child(2) ul,
.MuiDrawer-paper ul {
    background: transparent !important;
    padding: 4px 0 !important;
}

/* Each chat message */
.MuiGrid2-root:nth-child(2) ul > li,
.MuiDrawer-paper ul > li {
    padding: 6px 12px 6px 9px !important;
    border-radius: 0 !important;
    border-bottom: none !important;
    transition: background .12s !important;
    white-space: pre-wrap !important;
    line-height: 1.45 !important;
}
.MuiGrid2-root:nth-child(2) ul > li:hover,
.MuiDrawer-paper ul > li:hover {
    background: rgba(255,255,255,0.06) !important;
}

/* ── Alternating row stripes ── */
#ep-chat-list > li:nth-child(even),
.MuiGrid2-root:nth-child(2) ul > li:nth-child(even),
.MuiDrawer-paper ul > li:nth-child(even) {
    background: rgba(255,255,255,0.025) !important;
}

/* ── Per-user left-border accent ── */
#ep-chat-list > li[data-ep-user],
.MuiGrid2-root:nth-child(2) ul > li[data-ep-user],
.MuiDrawer-paper ul > li[data-ep-user] {
    border-left: 3px solid var(--ep-user-color, ${acc}) !important;
    padding-left: 10px !important;
}

/* ── Username labels: own line above message body ── */
#ep-chat-list > li strong, #ep-chat-list > li b,
.MuiGrid2-root:nth-child(2) ul > li strong,
.MuiDrawer-paper ul > li strong,
.MuiGrid2-root:nth-child(2) ul > li b,
.MuiDrawer-paper ul > li b {
    display: block !important;
    font-family: var(--ep-chat-font-family) !important;
    font-size: calc(var(--ep-chat-font-size) - 1px) !important;
    font-weight: 700 !important;
    letter-spacing: 0.04em !important;
    text-transform: uppercase !important;
    color: var(--ep-user-color, ${acc}) !important;
    margin-bottom: 2px !important;
    line-height: 1.2 !important;
}

/* Compact mode */
${settings.compactMode ? `
.MuiGrid2-root:nth-child(2) ul > li,
.MuiDrawer-paper ul > li {
    padding: 3px 12px 3px 9px !important;
}
#ep-chat-list > li[data-ep-user],
.MuiGrid2-root:nth-child(2) ul > li[data-ep-user],
.MuiDrawer-paper ul > li[data-ep-user] {
    padding-left: 10px !important;
}` : ''}

/* Tab bar */
div[role=tablist] {
    background: rgba(13,13,15,0.98) !important;
    border-bottom: 1px solid #1e1e1e !important;
}
div[role=tablist] button {
    color: #666 !important;
    font-size: 11px !important;
}
div[role=tablist] button.Mui-selected {
    color: ${acc} !important;
}
div[role=tablist] .MuiTabs-indicator {
    background: ${acc} !important;
}

/* Message text entry (typing box) — fixed size, not affected by chat font slider */
.ep-composer-textentry,
.ep-composer-textentry textarea,
.ep-composer-textentry input,
.ep-composer-textentry .MuiInputBase-input {
    font-size: 14px !important;
    line-height: 1.45 !important;
}
/* Chat input area styling (background only — no font overrides) */
.MuiInputBase-root {
    background: rgba(20,20,22,0.95) !important;
    border-radius: 8px !important;
}
.MuiFormControl-root:not(:has(input[name*="music" i], input[name*="sound" i])) .MuiInputLabel-root[data-shrink="false"],
.MuiAutocomplete-root:not(:has(input[name*="music" i], input[name*="sound" i])) .MuiInputLabel-root[data-shrink="false"] {
    transform: translate(0, 0) scale(1) !important;
    transform-origin: top left !important;
    top: 0 !important;
    left: 0 !important;
    font-size: 0.8125rem !important;
    line-height: 1.2 !important;
    opacity: 1 !important;
    color: rgba(255,255,255,0.95) !important;
}
.MuiFormControl-root:not(:has(input[name*="music" i], input[name*="sound" i])) .MuiInputLabel-root[data-shrink="false"].MuiInputLabel-shrink,
.MuiAutocomplete-root:not(:has(input[name*="music" i], input[name*="sound" i])) .MuiInputLabel-root[data-shrink="false"].MuiInputLabel-shrink {
    transform: translate(0, 0) scale(1) !important;
    top: 0 !important;
    left: 0 !important;
}
/* Font size: right-side chat log only (not tabs, buttons, or native UI) */
#ep-chat-list > li.ep-chat-msg,
.MuiDrawer-paper ul > li.ep-chat-msg,
.MuiGrid2-root:has(#ep-chat-list) ul > li.ep-chat-msg,
#ep-chat-list > li.ep-chat-msg *:not(.ep-ts):not(.ep-msg-btn):not(.ep-msg-context):not(.ep-inline-img):not(img):not(video):not(iframe):not(svg):not(path):not(button) {
    font-size: var(--ep-chat-font-size) !important;
    font-family: var(--ep-chat-font-family) !important;
}
/* Static font: active speech box + pose names (not affected by chat font slider) */
[data-ep-static-font],
[data-ep-static-font] *:not(.MuiInputBase-root):not(.MuiInputBase-input):not(textarea):not(input) {
    font-size: 14px !important;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
}
.MuiOutlinedInput-notchedOutline,
.MuiInput-underline::before,
.MuiInput-underline::after {
    border-color: #282828 !important;
}
.MuiInputBase-root:hover .MuiOutlinedInput-notchedOutline { border-color: #333 !important; }
.MuiInputBase-root.Mui-focused .MuiOutlinedInput-notchedOutline { border-color: ${acc} !important; }

/* Buttons */
.MuiButton-containedPrimary,
.MuiButton-containedInfo,
.MuiButton-containedViolet {
    background: ${acc} !important;
    color: #fff !important;
    border-radius: 7px !important;
}
.MuiButton-containedPrimary:hover,
.MuiButton-containedInfo:hover,
.MuiButton-containedViolet:hover {
    filter: brightness(1.15) !important;
}
.MuiButton-containedInfo.MuiButton-sizeSmall,
.MuiButton-containedViolet.MuiButton-sizeSmall {
    min-height: 32px !important;
}

/* Composer controls: pose, bubble, text speed, effects, music, sound, etc. */
.MuiToggleButton-root,
button[aria-label*="pose" i],
button[aria-label*="bubble" i],
button[aria-label*="effect" i],
button[aria-label*="music" i],
button[aria-label*="sound" i] {
    color: ${acc} !important;
    opacity: 1 !important;
    visibility: visible !important;
    pointer-events: auto !important;
}
.MuiToggleButton-root svg,
button[aria-label*="pose" i] svg,
button[aria-label*="bubble" i] svg,
button[aria-label*="effect" i] svg,
button[aria-label*="music" i] svg,
button[aria-label*="sound" i] svg {
    color: currentColor !important;
    fill: currentColor !important;
    opacity: 1 !important;
    visibility: visible !important;
}
.MuiIconButton-root.Mui-selected,
.MuiToggleButton-root.Mui-selected,
.MuiIconButton-root[aria-pressed="true"],
.MuiToggleButton-root[aria-pressed="true"] {
    background: color-mix(in srgb, ${acc} 24%, transparent) !important;
    color: #fff !important;
}
.MuiIconButton-root:hover,
.MuiToggleButton-root:hover {
    background: color-mix(in srgb, ${acc} 16%, transparent) !important;
}

/* Scrollbars in chat */
.MuiGrid2-root:nth-child(2) *::-webkit-scrollbar,
.MuiDrawer-paper *::-webkit-scrollbar { width: 4px !important; }
.MuiGrid2-root:nth-child(2) *::-webkit-scrollbar-thumb,
.MuiDrawer-paper *::-webkit-scrollbar-thumb { background: #252525 !important; border-radius: 2px !important; }

/* MUI chips / badges */
.MuiBadge-badge { background: ${acc} !important; }

/* Typing indicator */
.MuiTypography-caption { color: #555 !important; font-size: 10px !important; }

/* User list */
.MuiListItem-root:hover { background: rgba(255,255,255,0.03) !important; }
.MuiListItem-root.ep-chat-msg .MuiListItemText-root,
.MuiListItem-root.ep-chat-msg .MuiListItemText-root *,
.MuiListItem-root.ep-chat-msg .MuiListItemText-root .MuiTypography-root,
.MuiListItem-root.ep-chat-msg .MuiListItemText-root .MuiStack-root {
    background: transparent !important;
    background-image: none !important;
}
.MuiListItem-root.ep-chat-msg:hover .MuiListItemText-root,
.MuiListItem-root.ep-chat-msg:hover .MuiListItemText-root * {
    background: transparent !important;
    background-image: none !important;
}
.MuiListItem-root.ep-chat-msg:hover .MuiListItemText-root .MuiTypography-root {
    background: transparent !important;
}

/* ── Composer controls bar above text input (icon row: palette, effects, music, etc.) ── */
.ep-composer-toolbar,
[data-ep-composer-toolbar="root"],
[data-ep-composer-toolbar="root"] [data-ep-composer-painted="1"],
[data-ep-composer-painted="1"] {
    background: color-mix(in srgb, ${acc} 18%, rgba(11,11,13,0.99)) !important;
    background-color: color-mix(in srgb, ${acc} 18%, rgba(11,11,13,0.99)) !important;
    background-image: none !important;
    /* Overlay beats objection.lol inline room-theme backgrounds */
    box-shadow: inset 0 0 0 100vmax color-mix(in srgb, ${acc} 18%, rgba(11,11,13,0.99)) !important;
}
[data-ep-composer-toolbar="root"] {
    border-top: 1px solid color-mix(in srgb, ${acc} 25%, rgba(255,255,255,0.05)) !important;
}
[data-ep-composer-toolbar="root"]::before,
[data-ep-composer-toolbar="root"]::after,
.ep-composer-toolbar::before,
.ep-composer-toolbar::after {
    background: color-mix(in srgb, ${acc} 18%, rgba(11,11,13,0.99)) !important;
    background-color: color-mix(in srgb, ${acc} 18%, rgba(11,11,13,0.99)) !important;
}
/* CSS fallback: message composer icon toolbar (main typing area, not chat sidebar) */
[class*="ChatComposerToolbar"],
[role="toolbar"]:has(button[aria-label*="music" i]),
#root *:has(button[aria-label*="music" i]):has(button[aria-label*="sound" i]):not(:has(ul)):not(:has(textarea)):not(:has(.MuiInputBase-root)) {
    background: color-mix(in srgb, ${acc} 18%, rgba(11,11,13,0.99)) !important;
    background-color: color-mix(in srgb, ${acc} 18%, rgba(11,11,13,0.99)) !important;
    background-image: none !important;
}
/* The chat list must stay transparent to avoid double tint */
.MuiGrid2-root:nth-child(2) ul,
.MuiDrawer-paper ul,
.MuiGrid2-root:has(ul) ul {
    background: transparent !important;
    border-top: none !important;
}
/* Dividers */
.MuiGrid2-root:nth-child(2) .MuiDivider-root,
.MuiDrawer-paper .MuiDivider-root {
    border-color: color-mix(in srgb, ${acc} 30%, rgba(255,255,255,0.07)) !important;
}

/* Bubble / minimal message style */
${bubbleStyle === 'bubble' ? `
#ep-chat-list > li,
.MuiGrid2-root:nth-child(2) ul > li,
.MuiDrawer-paper ul > li {
    background: rgba(255,255,255,0.04) !important;
    border-radius: 10px !important;
    margin: 2px 6px !important;
}
#ep-chat-list > li:hover,
.MuiGrid2-root:nth-child(2) ul > li:hover,
.MuiDrawer-paper ul > li:hover {
    background: rgba(255,255,255,0.09) !important;
}
#ep-chat-list > li:nth-child(even),
.MuiGrid2-root:nth-child(2) ul > li:nth-child(even),
.MuiDrawer-paper ul > li:nth-child(even) {
    background: rgba(255,255,255,0.04) !important;
}
` : bubbleStyle === 'minimal' ? `
#ep-chat-list > li[data-ep-user],
.MuiGrid2-root:nth-child(2) ul > li[data-ep-user],
.MuiDrawer-paper ul > li[data-ep-user] {
    border-left: none !important;
    padding-left: 12px !important;
}
` : ''}

/* Accent glow */
${accentGlow ? `
#ep-top-cover, #ep-courtroom-bar {
    box-shadow: 0 2px 22px color-mix(in srgb, ${acc} 22%, transparent),
                0 1px 8px  color-mix(in srgb, ${acc2 || acc} 14%, transparent) !important;
}
.ep-toggle-slider {
    box-shadow: inset 0 0 0 1px color-mix(in srgb, ${acc} 35%, transparent) !important;
}
.ep-toggle input:checked + .ep-toggle-slider {
    background: ${accG} !important;
    box-shadow: 0 0 8px 2px color-mix(in srgb, ${acc2 || acc} 50%, transparent) !important;
}
#ep-panel-header {
    background: color-mix(in srgb, ${acc} 16%, rgba(15,15,17,0.98)) !important;
    border-bottom: 1px solid color-mix(in srgb, ${acc} 30%, transparent) !important;
}
` : ''}

/* Self-highlight (own messages) */
${selfName && selfHL ? `
li[data-ep-user="${selfName.replace(/"/g, '\\"')}"] {
    background: color-mix(in srgb, ${acc} 10%, rgba(255,255,255,0.03)) !important;
    border-left: 3px solid ${acc} !important;
    box-shadow: inset 3px 0 0 0 color-mix(in srgb, ${acc} 60%, transparent) !important;
}
li[data-ep-user="${selfName.replace(/"/g, '\\"')}"] strong,
li[data-ep-user="${selfName.replace(/"/g, '\\"')}"] b {
    color: color-mix(in srgb, ${acc} 85%, #fff) !important;
}
` : ''}

/* Timestamps */
${timestamps ? `
.ep-ts { display: inline !important; font-size: 9px !important; color: #444 !important; margin-right: 5px !important; font-family: monospace !important; vertical-align: middle !important; }
` : `.ep-ts { display: none !important; }`}

/* ── Top Bar style ── */
${(() => {
    const style = settings.topBarStyle || 'auto';
    const tbBg  = settings.topBarBg  || acc;
    const tbBg2 = settings.topBarBg2 || '';
    const tbBlur = typeof settings.topBarBlur === 'number' ? settings.topBarBlur : 12;
    const tbText = settings.topBarTextColor || '';
    const tbBorder = settings.topBarBorderBottom !== false;
    let bgRule = '';
    if      (style === 'solid')    bgRule = `background: ${tbBg} !important;`;
    else if (style === 'glass')    bgRule = `background: rgba(8,8,10,0.35) !important; backdrop-filter: blur(${tbBlur}px) saturate(180%) !important;`;
    else if (style === 'dark')     bgRule = `background: rgba(8,8,10,0.98) !important;`;
    else if (style === 'gradient') bgRule = `background: linear-gradient(135deg, ${tbBg}, ${tbBg2 || acc2 || tbBg}) !important;`;
    return `
#ep-top-cover {
    ${bgRule}
    ${tbText ? `color: ${tbText} !important;` : ''}
    ${tbBorder ? '' : 'border-bottom: none !important;'}
}
${tbText ? `#ep-top-cover .ep-top-btn, #ep-top-cover strong, #ep-top-cover span { color: ${tbText} !important; }` : ''}
`;
})()}

/* ── Stats visibility ── */
${settings.topBarShowStats === false ? `.ep-top-stat { display: none !important; }` : ''}

/* ── Message color overrides ── */
${settings.ownMsgBg && selfName ? `
li[data-ep-user="${selfName.replace(/"/g, '\\"')}"] {
    background: color-mix(in srgb, ${settings.ownMsgBg} 30%, transparent) !important;
}` : ''}
${settings.mentionBg ? `
li.ep-mentioned, li[data-ep-mentioned] {
    background: color-mix(in srgb, ${settings.mentionBg} 28%, transparent) !important;
}` : ''}
${settings.msgHoverBg ? `
.MuiGrid2-root:nth-child(2) ul > li:hover,
.MuiDrawer-paper ul > li:hover {
    background: color-mix(in srgb, ${settings.msgHoverBg} 40%, transparent) !important;
}` : ''}
${settings.linkColor ? `
#ep-chat-list a, .MuiDrawer-paper a,
.MuiGrid2-root:nth-child(2) a { color: ${settings.linkColor} !important; }` : ''}

/* ── Border radius ── */
${typeof settings.uiBorderRadius === 'number' ? `
:root { --ep-radius: ${settings.uiBorderRadius}px; }
.MuiButton-root, .ep-btn, .ep-panel-btn { border-radius: var(--ep-radius) !important; }
.MuiInputBase-root, .MuiOutlinedInput-root { border-radius: var(--ep-radius) !important; }
#ep-panel { border-radius: calc(var(--ep-radius) + 6px) !important; }
.ep-group { border-radius: var(--ep-radius) !important; }
#ep-top-cover .ep-top-btn { border-radius: calc(var(--ep-radius) - 2px) !important; }
` : ''}

/* ── Scrollbar ── */
${(() => {
    const w = settings.scrollbarWidth || 'thin';
    const c = settings.scrollbarColor || '#252525';
    const px = w === 'wide' ? '8px' : w === 'hidden' ? '0px' : '4px';
    return `
.MuiGrid2-root:nth-child(2) *::-webkit-scrollbar,
.MuiDrawer-paper *::-webkit-scrollbar { width: ${px} !important; }
.MuiGrid2-root:nth-child(2) *::-webkit-scrollbar-thumb,
.MuiDrawer-paper *::-webkit-scrollbar-thumb { background: ${c} !important; border-radius: 99px !important; }
`;
})()}

/* ── Chat pattern ── */
${(() => {
    const pat = settings.chatPattern || 'none';
    if (pat === 'none') return '';
    const pc  = settings.chatPatternColor || acc;
    const po  = typeof settings.chatPatternOpacity === 'number' ? settings.chatPatternOpacity : 0.04;
    const mix = `color-mix(in srgb, ${pc} ${Math.round(po * 100)}%, transparent)`;
    let bg = '', size = '';
    if (pat === 'dots')     { bg = `radial-gradient(circle, ${mix} 1.5px, transparent 1.5px)`;              size = '16px 16px'; }
    if (pat === 'grid')     { bg = `linear-gradient(${mix} 1px, transparent 1px), linear-gradient(90deg, ${mix} 1px, transparent 1px)`; size = '20px 20px'; }
    if (pat === 'lines')    { bg = `repeating-linear-gradient(45deg, ${mix} 0, ${mix} 1px, transparent 0, transparent 50%)`; size = '8px 8px'; }
    if (pat === 'diamonds') { bg = `linear-gradient(135deg, ${mix} 25%, transparent 25%) -10px 0, linear-gradient(225deg, ${mix} 25%, transparent 25%) -10px 0, linear-gradient(315deg, ${mix} 25%, transparent 25%), linear-gradient(45deg, ${mix} 25%, transparent 25%)`; size = '20px 20px'; }
    return `
.MuiDrawer-paper,
.MuiGrid2-root:nth-child(2) .MuiStack-root {
    background-image: ${bg} !important;
    background-size: ${size} !important;
    background-color: rgba(13,13,15,${opacity}) !important;
}`;
})()}
`;
        syncComposerToolbarTheme();
        tagComposerTextentry();
        applyChatFonts();
        tagStaticFontZones();
    }

    const EP_COMPOSER_TOOL_BTN_SEL = [
        'button[aria-label*="pose" i]',
        'button[aria-label*="bubble" i]',
        'button[aria-label*="effect" i]',
        'button[aria-label*="music" i]',
        'button[aria-label*="sound" i]',
        'button[aria-label*="speed" i]',
        'button[aria-label*="text speed" i]',
        'button[aria-label*="color" i]',
        'button[aria-label*="palette" i]',
        'button[aria-label*="theme" i]',
        'button[aria-label*="vibrat" i]',
        'button[aria-label*="shake" i]',
        'button[aria-label*="bright" i]',
    ].join(', ');

    let epComposerToolbarMo = null;
    let epComposerToolbarTick = 0;
    let epApplyingToolbar = false;

    function hasVisibleBackground(el) {
        const bg = getComputedStyle(el).backgroundColor;
        if (!bg || bg === 'transparent' || bg === 'rgba(0, 0, 0, 0)') return false;
        const m = bg.match(/rgba?\(\s*(\d+),\s*(\d+),\s*(\d+)/);
        if (!m) return true;
        const r = +m[1], g = +m[2], b = +m[3];
        return !(r < 18 && g < 18 && b < 18);
    }

    /** Main courtroom message composer (pose bar + icon toolbar + typing box) — NOT the chat sidebar. */
    function findMessageComposerScope() {
        const musicBtn = document.querySelector('button[aria-label*="music" i]');
        if (musicBtn) {
            return musicBtn.closest('.MuiGrid2-root')
                || musicBtn.closest('.MuiContainer-root')
                || document.getElementById('root');
        }
        const textarea = document.querySelector('textarea.MuiInputBase-inputMultiline, textarea');
        if (textarea) {
            const col = textarea.closest('.MuiGrid2-root');
            if (col && !col.querySelector('ul')) return col;
        }
        const grid = document.querySelector('#root > .MuiContainer-root > .MuiGrid2-root.MuiGrid2-container');
        if (grid) {
            const first = grid.querySelector(':scope > .MuiGrid2-root');
            if (first) return first;
        }
        return document.getElementById('root');
    }

    function findMessageComposerInput() {
        const scope = findMessageComposerScope();
        if (!scope) return null;
        return scope.querySelector('textarea.MuiInputBase-inputMultiline, textarea')
            || scope.querySelector('.MuiInputBase-root');
    }

    function tagComposerTextentry() {
        document.querySelectorAll('.ep-composer-textentry').forEach(el => {
            el.classList.remove('ep-composer-textentry');
        });
        const inputRoot = findMessageComposerInput()?.closest('.MuiInputBase-root')
            || findMessageComposerInput();
        if (inputRoot) inputRoot.classList.add('ep-composer-textentry');
        tagStaticFontZones();
    }

    function clearComposerToolbarPaint() {
        document.querySelectorAll('[data-ep-composer-toolbar], [data-ep-composer-painted], .ep-composer-toolbar').forEach(el => {
            el.classList.remove('ep-composer-toolbar');
            el.removeAttribute('data-ep-composer-toolbar');
            el.removeAttribute('data-ep-composer-painted');
            el.style.removeProperty('background');
            el.style.removeProperty('background-color');
            el.style.removeProperty('background-image');
            el.style.removeProperty('box-shadow');
            el.style.removeProperty('border-top');
        });
    }

    function findComposerToolbarRow() {
        const scope = findMessageComposerScope();
        const root = document.getElementById('root') || document.body;

        const byClass = scope?.querySelector('[class*="ChatComposerToolbar"]')
            || root.querySelector('[class*="ChatComposerToolbar"]');
        if (byClass) return byClass;

        const musicBtn = document.querySelector('button[aria-label*="music" i]');
        const soundBtn = document.querySelector('button[aria-label*="sound" i]');
        if (musicBtn && soundBtn) {
            let el = musicBtn.parentElement;
            let best = null;
            for (let i = 0; i < 16 && el; i++) {
                const btnCount = el.querySelectorAll('button, [role="button"]').length;
                if (el.contains(soundBtn) && btnCount >= 3 && btnCount <= 24) best = el;
                if (btnCount >= 5 && el.contains(soundBtn)) return el;
                el = el.parentElement;
            }
            if (best) return best;
        }

        const input = findMessageComposerInput();
        if (input) {
            const inputTop = input.getBoundingClientRect().top;
            const searchRoot = scope || root;
            let best = null, bestH = Infinity;
            for (const el of searchRoot.querySelectorAll('[role="toolbar"], .MuiStack-root, .MuiBox-root, div')) {
                if (el.contains(input)) continue;
                const rect = el.getBoundingClientRect();
                if (rect.height < 20 || rect.height > 100) continue;
                if (rect.bottom > inputTop + 12 || rect.bottom < inputTop - 200) continue;
                const btns = el.querySelectorAll('button, [role="button"]').length;
                if (btns < 3) continue;
                if (rect.height < bestH) { best = el; bestH = rect.height; }
            }
            if (best) return best;
        }

        const anchor = document.querySelector(EP_COMPOSER_TOOL_BTN_SEL);
        if (!anchor) return null;

        let best = null;
        let el = anchor;
        for (let i = 0; i < 14 && el; i++) {
            const toolCount = el.querySelectorAll(EP_COMPOSER_TOOL_BTN_SEL).length;
            const btnCount = el.querySelectorAll('button, [role="button"]').length;
            if (toolCount >= 2 && btnCount >= 3 && btnCount <= 24) best = el;
            if (toolCount >= 4) break;
            el = el.parentElement;
        }
        return best || anchor.parentElement;
    }

    function paintComposerToolbarTree(root, bg, borderTop) {
        const paint = (node, isRoot) => {
            node.classList.add('ep-composer-toolbar');
            node.dataset.epComposerToolbar = isRoot ? 'root' : 'part';
            if (!isRoot) node.dataset.epComposerPainted = '1';
            node.style.setProperty('background', bg, 'important');
            node.style.setProperty('background-color', bg, 'important');
            node.style.setProperty('background-image', 'none', 'important');
            node.style.setProperty('box-shadow', `inset 0 0 0 100vmax ${bg}`, 'important');
            if (isRoot) node.style.setProperty('border-top', borderTop, 'important');
        };
        paint(root, true);
        for (const child of root.querySelectorAll('*')) {
            if (child.closest('.MuiInputBase-root, textarea, .ep-composer-textentry')) continue;
            if (hasVisibleBackground(child)) paint(child, false);
        }
        // Site theme often sets bgcolor on a parent wrapper above the icon row
        let parent = root.parentElement;
        for (let i = 0; i < 4 && parent; i++) {
            if (parent.closest('.MuiInputBase-root, textarea')) break;
            if (hasVisibleBackground(parent)) paint(parent, false);
            parent = parent.parentElement;
        }
    }

    function ensureComposerToolbarWatcher(watchRoot) {
        if (!settings.chatReskin || !watchRoot) {
            epComposerToolbarMo?.disconnect();
            epComposerToolbarMo = null;
            return;
        }
        if (epComposerToolbarMo) return;
        epComposerToolbarMo = new MutationObserver(() => {
            if (epComposerToolbarTick) return;
            epComposerToolbarTick = requestAnimationFrame(() => {
                epComposerToolbarTick = 0;
                syncComposerToolbarTheme();
            });
        });
        epComposerToolbarMo.observe(watchRoot, { childList: true, subtree: true });
    }

    function syncComposerToolbarTheme() {
        if (epApplyingToolbar) return;
        epApplyingToolbar = true;
        try {
            clearComposerToolbarPaint();
            epComposerToolbarMo?.disconnect();
            epComposerToolbarMo = null;

            if (!settings.chatReskin) return;

            const acc = settings.chatAccentColor || '#e05a2b';
            const bg = `color-mix(in srgb, ${acc} 18%, rgba(11,11,13,0.99))`;
            const borderTop = `1px solid color-mix(in srgb, ${acc} 25%, rgba(255,255,255,0.05))`;

            const toolbar = findComposerToolbarRow();
            if (!toolbar) return;

            paintComposerToolbarTree(toolbar, bg, borderTop);
            tagComposerTextentry();
            ensureComposerToolbarWatcher(document.getElementById('root') || document.body);
            tagStaticFontZones();
        } finally {
            epApplyingToolbar = false;
        }
    }


    const EP_BG_PRESETS = {
       mondstadt: 'https://safe.cyctorn.tech/mC4ihh8U.jpg',
       prince: 'https://safe.cyctorn.tech/d6OSlDCF.jpeg',
        hula: 'https://safe.cyctorn.tech/IsmmuTjJ.jpg',
        cosmo: 'https://safe.cyctorn.tech/TYPJKG4M.jpeg',
    };

    function applyBackground() {
        let bg = document.getElementById('ep-bg');
        if (!bg) { bg = document.createElement('div'); bg.id = 'ep-bg'; document.body.prepend(bg); }
        let dimEl = document.getElementById('ep-bg-dim');
        if (!dimEl) { dimEl = document.createElement('div'); dimEl.id = 'ep-bg-dim'; bg.insertAdjacentElement('afterend', dimEl); }

        if (!settings.backgroundEnabled) {
            bg.classList.remove('active');
            dimEl.classList.remove('active');
            document.body.classList.remove('ep-has-bg');
            return;
        }
        const preset = settings.backgroundPreset || 'none';
        const url = EP_BG_PRESETS[preset] || settings.backgroundCustomUrl || '';
        if (!url) {
            bg.classList.remove('active');
            dimEl.classList.remove('active');
            document.body.classList.remove('ep-has-bg');
            return;
        }
        const blurVal = settings.backgroundBlur ?? 0;
        const dimVal  = settings.backgroundDim  ?? 0.55;
        bg.style.backgroundImage = `url("${url.replace(/"/g, '%22')}")`;
        bg.style.filter = blurVal > 0 ? `blur(${blurVal}px)` : '';
        bg.style.inset = blurVal > 0 ? `-${Math.ceil(blurVal * 1.5)}px` : '0';
        bg.classList.add('active');
        dimEl.style.opacity = String(dimVal);
        dimEl.classList.add('active');
        document.body.classList.add('ep-has-bg');
    }

    // ─── Settings Panel ─────────────────────────────────────────────────────────
    let panelEl = null;
    let activeTab = 'general';

    function createPanel() {
        const el = document.createElement('div');
        el.id = 'ep-panel';
        el.className = 'hidden';
        el.innerHTML = `
<div id="ep-panel-header">
    <h2>법</h2>
    <button id="ep-panel-close" title="Close (Esc)">\u00D7</button>
</div>
<div id="ep-tabs">
    <button class="ep-tab active" data-tab="general">General</button>
    <button class="ep-tab" data-tab="chat">Chat</button>
    <button class="ep-tab" data-tab="media">Media</button>
    <button class="ep-tab" data-tab="reskin">Appearance</button>
    <button class="ep-tab" data-tab="advanced">Advanced</button>
    <button class="ep-tab" data-tab="tts">TTS</button>
</div>
<div id="ep-panel-body">

<!-- GENERAL -->
<div class="ep-section active" data-section="general">
    <div class="ep-group">
        <div class="ep-group-title">Highlights & Pings</div>
        ${row('highlightWords', 'text', 'Highlight Words', 'Comma-separated words to highlight in chat')}
        ${row('playSoundOnHighlight', 'toggle', 'Sound on Highlight', 'Play a sound when a highlighted word appears')}
        ${row('mentionSound', 'toggle', 'Mention Sound', 'Play a sound when your name is mentioned')}
        ${row('notificationSoundUrl', 'text', 'Sound URL', 'Leave blank for default notification sound')}
        ${rowRange('notificationSoundVolume', 'Volume', 0, 1, 0.01)}
        ${rowRange('notificationSoundSeek', 'Sound Start (ms)', 0, 10000, 100)}
        ${rowRange('notificationSoundDuration', 'Sound Duration (ms)', 0, 10000, 100, '0 = play full')}
    </div>
    <div class="ep-group">
        <div class="ep-group-title">Sound Effects</div>
        ${rowRange('sfxVolume', 'SFX Volume', 0, 1, 0.01)}
        ${row('sfxJoinUrl',   'url', 'Join Sound',         'Paste an audio URL \u2014 played when someone joins the courtroom')}
        ${row('sfxLeaveUrl',  'url', 'Leave Sound',        'Played when someone leaves the courtroom')}
        ${row('sfxPairUrl',   'url', 'Pair Request Sound', 'Played when you receive a pair request')}
        ${row('sfx8ballUrl',  'url', '!8ball Sound',       'Played when anyone types !8ball')}
        ${row('sfxRollUrl',   'url', '!roll Sound',        'Played when anyone types !roll')}
    </div>
    <div class="ep-group">
        <div class="ep-group-title">Hotkeys</div>
        ${row('disableHotkeys', 'toggle', 'Disable ADT Hotkeys', 'Block A/D/T keys from the game')}
        ${row('enhancerHotkeys', 'toggle', 'Enhancer Hotkeys', 'Ctrl+Shift+E: Settings · Ctrl+F: Search · Ctrl+K: Assets · Ctrl+Shift+S: Scroll-lock')}
    </div>
    <div class="ep-group">
        <div class="ep-group-title">Misc</div>
        ${row('leaveWarning', 'toggle', 'Leave-page Warning', 'Confirm before closing the tab')}
        ${row('fixEvidenceStretch', 'toggle', 'Fix Evidence Stretch', 'Maintain aspect ratio for evidence images')}
        ${row('catboxUpload', 'toggle', 'Drag-to-Upload', 'Drag files/links onto inputs to upload to catbox.moe')}
        ${row('suppressOwnTyping', 'toggle', 'Suppress Own Typing', "Don't broadcast typing indicators")}
    </div>
</div>

<!-- CHAT -->
<div class="ep-section" data-section="chat">
    <div class="ep-group">
        <div class="ep-group-title">My Identity</div>
        ${row('myUsername', 'text', 'My Username', 'Your courtroom name — your messages get a distinct highlight')}
        ${row('selfHighlight', 'toggle', 'Highlight Own Messages', 'Dim all other messages when you send one')}
    </div>
    <div class="ep-group">
        <div class="ep-group-title">Chat Feed</div>
        ${row('autoScroll', 'toggle', 'Auto-scroll', 'Automatically scroll to new messages')}
        ${row('inlineImages', 'toggle', 'Inline Media', 'Render images, YouTube, and Twitter/X posts directly in chat')}
    </div>
    <div class="ep-group">
        <div class="ep-group-title">User Blocking</div>
        ${row('blockedUsers', 'text', 'Blocked Users', 'Comma-separated usernames to mute')}
    </div>
    <div class="ep-group">
        <div class="ep-group-title">Actions</div>
        <div class="ep-row">
            <div class="ep-label"><span>Export Chat Log</span><small>Download all messages as a file</small></div>
            <div style="display:flex;gap:6px;align-items:center;">
                <select id="ep-export-fmt" style="background:#111;border:1px solid #333;color:#e8e8e8;border-radius:6px;padding:4px 6px;font-size:12px;">
                    <option value="txt">TXT</option>
                    <option value="json">JSON</option>
                    <option value="md">Markdown</option>
                </select>
                <button class="ep-btn secondary" id="ep-export-btn" style="padding:5px 10px;font-size:11px;">Export</button>
            </div>
        </div>
        <div class="ep-row">
            <div class="ep-label"><span>Clear Chat Log</span><small>Wipe the in-memory log</small></div>
            <button class="ep-btn danger" id="ep-clear-log-btn" style="padding:5px 10px;font-size:11px;">Clear</button>
        </div>
    </div>
</div>

<!-- MEDIA -->
<div class="ep-section" data-section="media">
    <div class="ep-group">
        <div class="ep-group-title">Uploads</div>
        ${row('catboxUpload', 'toggle', 'Drag-to-Upload', 'Drag files or links onto text boxes to upload')}
        ${row('showCatboxStatus', 'toggle', 'Host Status', 'Show Catbox / File Garden up-down indicators in the bottom bar (auto-refreshes every 30s)')}
        ${rowSelect('uploadProvider', 'Upload Provider', [
            ['catbox', 'Catbox.moe'],
            ['filegarden', 'File Garden'],
            ['cyctorn', 'Cyctorn']
        ], 'Catbox works without login. File Garden needs your user ID and token. Cyctorn needs a token.')}
        ${row('filegardenUserId', 'text', 'File Garden User ID', 'Only needed when File Garden is selected')}
        ${row('filegardenToken', 'text', 'File Garden Token', 'Optional authorization token for private gardens')}
        ${row('cyctornToken', 'text', 'Cyctorn Token', 'Token for safe.cyctorn.tech uploads')}
    </div>
    <div class="ep-group">
        <div class="ep-group-title">Hover Previews</div>
        ${row('imageHoverPopup', 'toggle', 'Images', 'Hover over image links to preview them')}
        ${row('videoHoverPopup', 'toggle', 'Videos', 'Hover over video links to preview them')}
        ${row('audioHoverPopup', 'toggle', 'Audio', 'Hover over audio links to play them')}
        ${row('youtubeHoverPopup', 'toggle', 'YouTube', 'Hover over YouTube links to play them')}
        ${row('twitterHoverPopup', 'toggle', 'Twitter / X', 'Hover over tweets to preview them')}
        ${row('tenorHoverPopup', 'toggle', 'Tenor GIFs', 'Hover over Tenor links to preview GIFs; also embeds inline')}
        ${row('klipyHoverPopup', 'toggle', 'Klipy GIFs', 'Hover over Klipy links to preview GIFs; also embeds inline')}
        ${row('fourchanHoverPopup', 'toggle', '4chan Posts', 'Hover over 4chan/4channel links to preview posts & images; also embeds inline')}
    </div>
    <div class="ep-group">
        <div class="ep-group-title">Rich Embeds</div>
        ${row('spotifyHoverPopup', 'toggle', 'Spotify', 'Embed Spotify tracks, albums, playlists, podcasts inline')}
        ${row('googleDocHoverPopup', 'toggle', 'Google Docs / Sheets / Slides', 'Preview Google documents inline')}
        ${row('githubHoverPopup', 'toggle', 'GitHub', 'Show repo / issue / PR cards inline')}
        ${row('steamHoverPopup', 'toggle', 'Steam Store', 'Embed Steam store pages inline')}
    </div>
    <div class="ep-group">
        <div class="ep-group-title">Frame Popups</div>
        ${row('imageFramePopup', 'toggle', 'Image Frame Popups', 'Show shared images as overlays on the courtroom scene')}
        ${rowSelect('framePopupSize', 'Frame Popup Size', [
            ['small', 'Small'],
            ['medium', 'Medium (default)'],
            ['large', 'Large'],
        ], 'How much of the character half the popup fills')}
    </div>
    <div class="ep-group">
        <div class="ep-group-title">GIF Picker</div>
        ${rowSelect('gifPickerSource', 'GIF Source', [['giphy','Giphy'],['klipy','Klipy']], 'Which service to search when the GIF picker is open')}
        ${row('giphyApiKey', 'text', 'Giphy API Key', 'Used when source is Giphy. Get a free key at developers.giphy.com.')}
        ${row('klipyApiKey', 'text', 'Klipy API Key', 'Used when source is Klipy.')}
    </div>
</div>


<!-- RESKIN -->
<div class="ep-section" data-section="reskin">
    <div class="ep-group">
        <div class="ep-group-title">Layout & Display</div>
        ${row('compactMode', 'toggle', 'Compact Mode', 'Tighter line spacing in chat')}
        ${rowRange('chatFontSize', 'Chat Font Size', 8, 72, 1, 'px')}
        ${row('showTimestamps', 'toggle', 'Timestamps', 'Prepend HH:MM to each message')}
    </div>
    <div class="ep-group">
        <div class="ep-group-title">Theme</div>
        ${row('chatReskin', 'toggle', 'Enable Reskin', 'Apply custom dark theme to the chatroom')}
        ${rowSwatches('Theme Presets', [
            ['#e05a2b','#ff8c42','Ember'],
            ['#c0392b','#ff6b6b','Crimson'],
            ['#db2777','#f472b6','Rose'],
            ['#7c3aed','#a855f7','Violet'],
            ['#6d28d9','#06b6d4','Aurora'],
            ['#1d4ed8','#38bdf8','Sapphire'],
            ['#059669','#34d399','Jade'],
            ['#b45309','#fbbf24','Gold'],
        ])}
        ${rowColor('chatAccentColor',  'Accent Start', '#e05a2b')}
        ${rowColor('chatAccentColor2', 'Accent End',   '')}
        ${rowRange('chatOpacity', 'Chat Opacity', 0.3, 1, 0.01, 'Transparency of the chat sidebar background')}
        ${rowRange('chatBlur', 'Chat Blur (px)', 0, 28, 1, 'Backdrop blur on the chat sidebar')}
        ${rowSelect('messageBubbleStyle', 'Message Style', [
            ['flat', 'Flat (default)'],
            ['bubble', 'Bubble (soft background per message)'],
            ['minimal', 'Minimal (no left border)'],
        ], 'Visual style for chat messages')}
        ${row('showMsgContext', 'toggle', 'Show Pose Badge', 'Show the Pose: [x] badge above each chat message (off by default)')}
        ${row('threadingEnabled', 'toggle', 'Conversation Threading', 'Add a Reply button to messages so you can quote and reply inline')}
        ${row('accentGlow', 'toggle', 'Accent Glow', 'Add a soft glow to accent-colored elements')}
    </div>
    <div class="ep-group">
        <div class="ep-group-title">Top Bar</div>
        ${rowSelect('topBarStyle', 'Style', [
            ['auto',     'Auto (accent tint)'],
            ['solid',    'Solid Color'],
            ['glass',    'Frosted Glass'],
            ['dark',     'Pure Dark'],
            ['gradient', 'Gradient'],
        ], 'Visual treatment of the top navigation bar')}
        ${rowColor('topBarBg',        'Bar Color',      '')}
        ${rowColor('topBarBg2',       'Gradient End',   '')}
        ${rowColor('topBarTextColor', 'Text Color',     '')}
        ${rowRange('topBarBlur', 'Glass Blur (px)', 0, 40, 1, 'Backdrop blur — only applies in Glass mode')}
        ${row('topBarBorderBottom', 'toggle', 'Bottom Border', 'Show a 1px separator under the top bar')}
        ${row('topBarShowStats', 'toggle', 'Show Stats', 'Display message and user counters in the top bar')}
    </div>
    <div class="ep-group">
        <div class="ep-group-title">Message Colors</div>
        ${rowColor('ownMsgBg',   'Own Messages',   '')}
        ${rowColor('mentionBg',  'Mentions',       '')}
        ${rowColor('msgHoverBg', 'Hover',          '')}
        ${rowColor('linkColor',  'Links',          '')}
        <small style="color:#555;font-size:11px;margin-top:2px;display:block;">Leave blank to use the accent colour defaults.</small>
    </div>
    <div class="ep-group">
        <div class="ep-group-title">UI Chrome</div>
        ${rowRange('uiBorderRadius', 'Border Radius', 0, 20, 1, 'px — applied to buttons, inputs, and cards')}
        ${rowSelect('scrollbarWidth', 'Scrollbar', [
            ['thin',   'Thin (4 px)'],
            ['wide',   'Wide (8 px)'],
            ['hidden', 'Hidden'],
        ], 'Chat panel scrollbar thickness')}
        ${rowColor('scrollbarColor', 'Scrollbar Color', '')}
    </div>
    <div class="ep-group">
        <div class="ep-group-title">Chat Pattern</div>
        ${rowSelect('chatPattern', 'Pattern', [
            ['none',     'None'],
            ['dots',     'Dots'],
            ['grid',     'Grid'],
            ['lines',    'Diagonal Lines'],
            ['diamonds', 'Diamonds'],
        ], 'Subtle repeating background pattern in the chat panel')}
        ${rowColor('chatPatternColor', 'Pattern Color', '')}
        ${rowRange('chatPatternOpacity', 'Opacity', 0, 0.2, 0.005)}
    </div>
    <div class="ep-group">
        <div class="ep-group-title">Custom CSS</div>
        <div class="ep-row" style="flex-direction:column;align-items:flex-start;gap:6px;">
            <div class="ep-label"><span>Inject CSS</span><small>Applied after all other styles — use !important to override anything</small></div>
            <textarea id="ep-custom-css-input" rows="7" placeholder="/* your CSS here */"
                style="width:100%;background:#0d0d0f;border:1px solid #2a2a2a;color:#c8c8c8;border-radius:6px;padding:8px;font-size:11px;font-family:monospace;resize:vertical;box-sizing:border-box;line-height:1.5;"></textarea>
        </div>
    </div>
    <div class="ep-group">
        <div class="ep-group-title">Font</div>
        ${rowSelect('chatFont', 'Chat Font', [
            ['system', 'System Default'],
            ['inter', 'Inter'],
            ['roboto', 'Roboto'],
            ['noto', 'Noto Sans'],
            ['jetbrains', 'JetBrains Mono'],
            ['comic', 'Comic Sans'],
            ['courier', 'Courier New'],
            ['georgia', 'Georgia'],
            ['custom', 'Custom (use URL below)'],
        ], 'Applied client-wide — Google Fonts presets load automatically')}
        ${row('chatFontCustomUrl', 'url', 'Custom Font URL', 'Direct link to a .woff/.woff2/.ttf file — only used when Custom is selected above')}
    </div>
    <div class="ep-group">
        <div class="ep-group-title">Background</div>
        ${row('backgroundEnabled', 'toggle', 'Enable Background', 'Show a custom image behind the courtroom')}
        ${rowSelect('backgroundPreset', 'Preset', [
            ['none', 'None / Use Custom URL'],
            ['prince', 'Prince'],
            ['cosmo', 'Cosmo'],
            ['mondstadt', 'Mondstadt'],
            ['hula', 'Hula Hoop'],
        ], 'Built-in presets, or choose None and paste your own URL below')}
        ${row('backgroundCustomUrl', 'url', 'Custom Image URL', 'Direct link to any image (only used when Preset is None)')}
        ${rowRange('backgroundDim', 'Dim', 0, 1, 0.01, '0 = no dim, 1 = full black')}
        ${rowRange('backgroundBlur', 'Blur (px)', 0, 24, 0.5)}
    </div>
    <div class="ep-group">
        <div class="ep-group-title">Widgets</div>
        ${row('showClock', 'toggle', 'Show Clock', 'Display current time in the top bar')}
        ${row('clockFormat24h', 'toggle', '24-hour Clock', 'Use 24-hour time instead of 12-hour')}
        ${row('showNowPlaying', 'toggle', 'Show Now Playing', 'Display a widget when music is playing')}
    </div>
</div>


<!-- ADVANCED -->
<div class="ep-section" data-section="advanced">
    <div class="ep-group">
        <div class="ep-group-title">About & Reset</div>
        <div class="ep-row">
            <div class="ep-label"><span>Version</span></div>
            <span style="color:#555;font-size:12px;font-family:monospace;">v0.8</span>
        </div>
        <div class="ep-row">
            <div class="ep-label"><span>Reset All Settings</span><small>Restores all defaults</small></div>
            <button class="ep-btn danger" id="ep-reset-btn" style="padding:5px 10px;font-size:11px;">Reset</button>
        </div>
    </div>
    <div class="ep-group">
        <div class="ep-group-title">Keyboard Shortcuts</div>
        <div style="padding:10px 12px;font-size:12px;color:#777;line-height:1.9;">
            <div><kbd style="background:#1f1f1f;border:1px solid #333;padding:1px 6px;border-radius:4px;color:#ccc">Ctrl+Shift+E</kbd> — Open Settings</div>
            <div><kbd style="background:#1f1f1f;border:1px solid #333;padding:1px 6px;border-radius:4px;color:#ccc">Ctrl+F</kbd> — Chat Search</div>
            <div><kbd style="background:#1f1f1f;border:1px solid #333;padding:1px 6px;border-radius:4px;color:#ccc">Ctrl+Shift+S</kbd> — Toggle Auto-scroll</div>
            <div><kbd style="background:#1f1f1f;border:1px solid #333;padding:1px 6px;border-radius:4px;color:#ccc">Ctrl+Shift+B</kbd> — Toggle Background</div>
            <div><kbd style="background:#1f1f1f;border:1px solid #333;padding:1px 6px;border-radius:4px;color:#ccc">Ctrl+Shift+C</kbd> — Toggle Compact Mode</div>
            <div><kbd style="background:#1f1f1f;border:1px solid #333;padding:1px 6px;border-radius:4px;color:#ccc">Ctrl+Shift+X</kbd> — Export Chat Log</div>
            <div><kbd style="background:#1f1f1f;border:1px solid #333;padding:1px 6px;border-radius:4px;color:#ccc">Ctrl+Shift+N</kbd> — Toggle Now Playing</div>
            <div><kbd style="background:#1f1f1f;border:1px solid #333;padding:1px 6px;border-radius:4px;color:#ccc">Esc</kbd> — Close panels</div>
        </div>
    </div>
</div>

<!-- TTS -->
<div class="ep-section" data-section="tts">
    <div class="ep-group">
        <div class="ep-group-title">Text-to-Speech</div>
        ${row('ttsEnabled', 'toggle', 'Enable TTS', 'Read every new chat message aloud using your browser\'s speech synthesis')}
        ${rowRange('ttsVolume', 'Volume', 0, 1, 0.05)}
        ${rowRange('ttsRate', 'Speed', 0.5, 2, 0.05, '1.0 = normal')}
        ${rowRange('ttsPitch', 'Pitch', 0, 2, 0.05, '1.0 = normal')}
        ${row('ttsSpeakUsername', 'toggle', 'Announce Username', 'Prefix each message with the sender\'s name (e.g. \"Alice says: hello\")')}
        ${row('ttsSkipUrls', 'toggle', 'Skip URLs', 'Replace links with "[link]" so they are not read aloud')}
        ${row('ttsAutoAssignVoice', 'toggle', 'Random Voices per User', 'Automatically assign each new chatter a random voice — saved so the same person always sounds the same')}
        ${row('ttsInterruptSelf', 'toggle', 'Self-Interrupt', 'Cut off your own TTS if you send another message while it is still playing')}
    </div>
    <div class="ep-group">
        <div class="ep-group-title">Voice</div>
        <div class="ep-row" id="ep-tts-voice-row">
            <div class="ep-label"><span>Voice</span><small>Google voices listed first — enable TTS then reopen panel to populate</small></div>
            <select id="ep-tts-voice-select" style="background:#111;border:1px solid #333;color:#e8e8e8;border-radius:6px;padding:4px 8px;font-size:12px;max-width:200px;"></select>
        </div>
    </div>
    <div class="ep-group">
        <div class="ep-group-title">Per-User Voices &amp; Modulation</div>
        <div id="ep-tts-user-list" style="display:flex;flex-direction:column;gap:6px;margin-bottom:8px;"></div>
        <div style="display:grid;grid-template-columns:1fr auto;gap:6px 8px;align-items:center;">
            <div style="grid-column:1/-1;display:flex;gap:6px;align-items:center;flex-wrap:wrap;">
                <input id="ep-tts-uv-name" type="text" placeholder="Username"
                    style="background:#111;border:1px solid #333;color:#e8e8e8;border-radius:6px;padding:4px 8px;font-size:12px;flex:1;min-width:80px;">
                <select id="ep-tts-uv-voice"
                    style="background:#111;border:1px solid #333;color:#e8e8e8;border-radius:6px;padding:4px 8px;font-size:12px;max-width:200px;"></select>
            </div>
            <div style="grid-column:1/-1;display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
                <label style="font-size:11px;color:#888;display:flex;align-items:center;gap:5px;">
                    Speed
                    <input id="ep-tts-uv-rate" type="number" value="1.0" min="0.5" max="2" step="0.05"
                        style="background:#111;border:1px solid #333;color:#e8e8e8;border-radius:6px;padding:3px 6px;font-size:12px;width:60px;">
                </label>
                <label style="font-size:11px;color:#888;display:flex;align-items:center;gap:5px;">
                    Pitch
                    <input id="ep-tts-uv-pitch" type="number" value="1.0" min="0" max="2" step="0.05"
                        style="background:#111;border:1px solid #333;color:#e8e8e8;border-radius:6px;padding:3px 6px;font-size:12px;width:60px;">
                </label>
                <button class="ep-btn secondary" id="ep-tts-uv-add" style="padding:5px 10px;font-size:11px;margin-left:auto;">Add / Update</button>
            </div>
        </div>
        <small style="color:#555;font-size:11px;margin-top:4px;display:block;">Assign a unique voice, speed, and pitch per user — overrides the global defaults for their messages.</small>
    </div>
    <div class="ep-group">
        <div class="ep-group-title">Test</div>
        <div class="ep-row">
            <div class="ep-label"><span>Preview TTS</span><small>Speak a test phrase now</small></div>
            <button class="ep-btn secondary" id="ep-tts-test-btn" style="padding:5px 10px;font-size:11px;">Speak Test</button>
        </div>
    </div>
</div>

</div><!-- end panel-body -->
<div id="ep-panel-footer">
    <span style="font-size:11px;color:#444;">Your settings automatically save.</span>
    <div style="display:flex;gap:6px;">
        <button class="ep-btn secondary" id="ep-panel-close-btn">Close</button>
    </div>
</div>
`;

        document.body.appendChild(el);
        panelEl = el;
        bindPanelEvents();
    }

    function row(key, type, label, desc) {
        const val = settings[key];
        if (type === 'toggle') {
            return `<div class="ep-row" data-key="${key}">
                <div class="ep-label"><span>${escapeHTML(label)}</span>${desc ? `<small>${escapeHTML(desc)}</small>` : ''}</div>
                <label class="ep-toggle"><input type="checkbox" name="${key}" ${val ? 'checked' : ''}><span class="ep-toggle-slider"></span></label>
            </div>`;
        }
        return `<div class="ep-row" data-key="${key}">
            <div class="ep-label"><span>${escapeHTML(label)}</span>${desc ? `<small>${escapeHTML(desc)}</small>` : ''}</div>
            <input type="${type}" name="${key}" value="${escapeHTML(String(val ?? ''))}" placeholder="${escapeHTML(desc || '')}">
        </div>`;
    }

    function rowRange(key, label, min, max, step, desc) {
        const val = settings[key] ?? 0;
        return `<div class="ep-row" data-key="${key}">
            <div class="ep-label"><span>${escapeHTML(label)}</span>${desc ? `<small>${escapeHTML(desc)}</small>` : ''}</div>
            <div style="display:flex;flex-direction:column;align-items:flex-end;gap:2px;">
                <input type="range" name="${key}" min="${min}" max="${max}" step="${step}" value="${val}">
                <span class="ep-range-val" style="font-size:10px;color:#666;">${val}</span>
            </div>
        </div>`;
    }

    function rowSwatches(label, presets) {
        const swatchHTML = presets.map(([c1, c2, name]) =>
            `<button class="ep-swatch" title="${name}" data-c1="${c1}" data-c2="${c2}"
             style="background:linear-gradient(135deg,${c1},${c2});" type="button"></button>`
        ).join('');
        return `<div class="ep-row ep-swatch-row">
            <span class="ep-label">${label}</span>
            <span class="ep-swatches">${swatchHTML}</span>
        </div>`;
    }
    function rowColor(key, label, defaultVal) {
        const val = settings[key] || defaultVal;
        return `<div class="ep-row" data-key="${key}">
            <div class="ep-label"><span>${escapeHTML(label)}</span></div>
            <input type="color" name="${key}" value="${escapeHTML(val)}">
        </div>`;
    }

    function rowSelect(key, label, options, desc) {
        const val = settings[key] ?? '';
        const opts = options.map(opt => {
            const value = Array.isArray(opt) ? opt[0] : opt;
            const text = Array.isArray(opt) ? opt[1] : opt;
            return `<option value="${escapeHTML(String(value))}" ${String(value) === String(val) ? 'selected' : ''}>${escapeHTML(String(text))}</option>`;
        }).join('');
        return `<div class="ep-row" data-key="${key}">
            <div class="ep-label"><span>${escapeHTML(label)}</span>${desc ? `<small>${escapeHTML(desc)}</small>` : ''}</div>
            <select name="${key}">${opts}</select>
        </div>`;
    }

    function bindPanelEvents() {
        // Tab switching
        panelEl.querySelectorAll('.ep-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                activeTab = tab.dataset.tab;
                panelEl.querySelectorAll('.ep-tab').forEach(t => t.classList.toggle('active', t === tab));
                panelEl.querySelectorAll('.ep-section').forEach(s => s.classList.toggle('active', s.dataset.section === activeTab));
            });
        });

        // Close buttons
        panelEl.querySelector('#ep-panel-close').addEventListener('click', closePanel);
        panelEl.querySelector('#ep-panel-close-btn').addEventListener('click', closePanel);

        // Input changes
        panelEl.querySelectorAll('.ep-swatch').forEach(swatch => {
            swatch.addEventListener('click', () => {
                const c1 = swatch.dataset.c1, c2 = swatch.dataset.c2;
                settings.chatAccentColor  = c1;
                settings.chatAccentColor2 = c2;
                saveSettings();
                applyReskinCSS();
                // sync color pickers
                const p1 = panelEl.querySelector('[data-key="chatAccentColor"] input');
                const p2 = panelEl.querySelector('[data-key="chatAccentColor2"] input');
                if (p1) p1.value = c1;
                if (p2) p2.value = c2;
                // mark selected
                panelEl.querySelectorAll('.ep-swatch').forEach(s => s.classList.remove('selected'));
                swatch.classList.add('selected');
            });
        });
        panelEl.querySelectorAll('input, select').forEach(input => {
            const key = input.name || input.closest('[data-key]')?.dataset.key;
            if (!key) return;

            input.addEventListener('change', () => {
                let val;
                if (input.type === 'checkbox') val = input.checked;
                else if (input.type === 'range' || input.type === 'number') val = parseFloat(input.value);
                else val = input.value;

                settings[key] = val;
                saveSettings();
                onSettingChanged(key, val);
            });

            if (input.type === 'range') {
                input.addEventListener('input', () => {
                    const span = input.parentElement.querySelector('.ep-range-val');
                    if (span) span.textContent = input.value;
                    // Live-update visual settings without waiting for 'change'
                    const liveKeys = ['chatOpacity','chatFontSize','chatBlur','backgroundDim','backgroundBlur','sfxVolume'];
                    if (key === 'chatFontSize') {
                        tagComposerTextentry();
                        applyChatFonts();
                        tagStaticFontZones();
                    }
                    if (key && liveKeys.includes(key)) {
                        settings[key] = parseFloat(input.value);
                        onSettingChanged(key, settings[key]);
                    }
                });
            }

            if (input.type === 'color') {
                input.addEventListener('input', () => {
                    settings[key] = input.value;
                    onSettingChanged(key, input.value);
                });
            }
        });

        // Export
        panelEl.querySelector('#ep-export-btn').addEventListener('click', exportChatLog);
        panelEl.querySelector('#ep-clear-log-btn').addEventListener('click', () => {
            chatLog = [];
            showToast('Chat log cleared.');
        });
        // TTS: populate voices + test button + per-user voice UI
        if (window.speechSynthesis) {
            populateTTSVoices();
            window.speechSynthesis.onvoiceschanged = populateTTSVoices;
            panelEl.querySelector('#ep-tts-uv-add')?.addEventListener('click', () => {
                const nameEl  = panelEl.querySelector('#ep-tts-uv-name');
                const voiceEl = panelEl.querySelector('#ep-tts-uv-voice');
                const rateEl  = panelEl.querySelector('#ep-tts-uv-rate');
                const pitchEl = panelEl.querySelector('#ep-tts-uv-pitch');
                const uname = (nameEl?.value || "").trim();
                if (!uname) { showToast("Enter a username first."); return; }
                const vname = voiceEl?.value || "";
                const vrate  = parseFloat(rateEl?.value  ?? 1.0) || 1.0;
                const vpitch = parseFloat(pitchEl?.value ?? 1.0) || 1.0;
                const uv = Object.assign({}, settings.ttsUserVoices);
                uv[uname.toLowerCase()] = { voice: vname, rate: vrate, pitch: vpitch };
                settings.ttsUserVoices = uv;
                saveSettings();
                if (nameEl) nameEl.value = "";
                if (rateEl)  rateEl.value  = "1.0";
                if (pitchEl) pitchEl.value = "1.0";
                renderTTSUserVoiceList();
                showToast(`Settings saved for "${uname}"`);
            });
            panelEl.querySelector('#ep-tts-uv-name')?.addEventListener('keydown', e => {
                if (e.key === "Enter") panelEl.querySelector('#ep-tts-uv-add')?.click();
            });
            panelEl.querySelector('#ep-tts-test-btn')?.addEventListener('click', () => {
                ttsQueue = []; _cancelActive();
                const utt = new SpeechSynthesisUtterance('Objection! This is a TTS test message.');
                utt.rate   = typeof settings.ttsRate   === 'number' ? settings.ttsRate   : 1.0;
                utt.pitch  = typeof settings.ttsPitch  === 'number' ? settings.ttsPitch  : 1.0;
                utt.volume = typeof settings.ttsVolume === 'number' ? settings.ttsVolume : 1.0;
                if (settings.ttsVoice) {
                    const match = window.speechSynthesis.getVoices().find(v => v.name === settings.ttsVoice);
                    if (match) utt.voice = match;
                }
                window.speechSynthesis.speak(utt);
            });
        }

        // Custom CSS textarea
        const customCSSEl = panelEl.querySelector('#ep-custom-css-input');
        if (customCSSEl) {
            customCSSEl.value = settings.customCSS || '';
            customCSSEl.addEventListener('input', () => {
                settings.customCSS = customCSSEl.value;
                saveSettings();
                applyCustomCSS();
            });
        }

        panelEl.querySelector('#ep-reset-btn').addEventListener('click', () => {
            if (confirm('Reset all Enhancer+ settings to defaults?')) {
                settings = Object.assign({}, DEFAULTS);
                saveSettings();
                rebuildPanel();
                applyReskinCSS();
                showToast('Settings reset.');
            }
        });
    }

    // ─── TTS ────────────────────────────────────────────────────────────────────────────
    // ─── TTS queue (Web Speech API, single output channel) ────────────────────────
    // Different speakers queue sequentially — browser TTS cannot overlap channels.
    // Same-speaker self-interrupt: always cancels own current utterance.
    let ttsQueue    = [];
    let ttsSpeaking = false;
    let ttsReady    = true;   // false during initial backfill
    let ttsActiveSpeakerKey = null;
    // Generation counter: bumped on cancel so stale onend callbacks are ignored.
    let ttsGen = 0;

    function ttsDequeue() {
        if (ttsSpeaking || !ttsQueue.length) return;
        ttsSpeaking = true;
        const item = ttsQueue.shift();
        const myGen = ttsGen;
        _playItem(item, () => {
            if (ttsGen !== myGen) return; // cancelled — ignore stale callback
            ttsSpeaking = false;
            ttsActiveSpeakerKey = null;
            ttsDequeue();
        });
    }

    function _playItem(item, onDone) {
        if (!window.speechSynthesis) { onDone(); return; }
        const utt = new SpeechSynthesisUtterance(item.text);
        utt.rate   = typeof item.rate  === "number" ? item.rate  : (typeof settings.ttsRate  === "number" ? settings.ttsRate  : 1.0);
        utt.pitch  = typeof item.pitch === "number" ? item.pitch : (typeof settings.ttsPitch === "number" ? settings.ttsPitch : 1.0);
        utt.volume = typeof settings.ttsVolume === "number" ? settings.ttsVolume : 1.0;
        const voiceName = item.voiceName || settings.ttsVoice || "";
        const allVoices = window.speechSynthesis.getVoices();
        const resolved  = voiceName ? allVoices.find(v => v.name === voiceName) : null;
        if (resolved) utt.voice = resolved;
        ttsActiveSpeakerKey = item.speakerKey || "__global__";
        utt.onend  = onDone;
        utt.onerror = onDone;
        try { window.speechSynthesis.speak(utt); } catch (_e) { onDone(); }
    }

    function _cancelActive() {
        ttsGen++;  // invalidate in-flight onDone callbacks before cancel fires onend
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        ttsActiveSpeakerKey = null;
        ttsSpeaking = false;
    }

    function _dispatchTTSItem(item) {
        const sk = item.speakerKey || "__global__";

        if (ttsActiveSpeakerKey === sk && ttsSpeaking) {
            // Same speaker talking again — cut off their current utterance immediately
            ttsQueue = ttsQueue.filter(q => q.speakerKey !== sk);
            _cancelActive();
        } else if (settings.ttsInterruptSelf) {
            // Same speaker has items queued but not yet speaking — drop them
            ttsQueue = ttsQueue.filter(q => q.speakerKey !== sk);
        }
        // Different speaker: queue behind whoever is currently speaking.
        // (Web Speech API is single-channel; true simultaneous overlap is not possible.)

        ttsQueue.push(item);
        ttsDequeue();
    }

    // ─── TTS text preprocessing rules ────────────────────────────────────────────
    // Applied to the raw message text before it is handed to the speech engine.
    // Returns { text, rateHint, pitchHint } where the hints are multipliers (1.0 = unchanged).
    function _preprocessTTSText(rawText) {
        let text = rawText;
        let rateHint  = 1.0;
        let pitchHint = 1.0;

        // Laugh acronyms → spoken laugh sounds
        text = text
            .replace(/\blmfao\b/gi,  'hahahaha')
            .replace(/\blmao\b/gi,   'hahaha')
            .replace(/\brofl\b/gi,   'ha ha ha ha')
            .replace(/\blol\b/gi,    'heh')
            .replace(/\bkek\b/gi,    'heh')
            .replace(/\bxdd+\b/gi,   'heh heh')
            .replace(/\bxd\b/gi,     'heh');

        // Greentext (lines starting with >) → comma pause before the line so
        // the voice naturally hesitates before reading it, like a deadpan aside.
        text = text.replace(/^>\s*/gm, ', ');

        // ALL CAPS words (2+ letters): prevent letter-by-letter reading.
        // Lowercase them and flag the utterance for a slightly slower,
        // slightly higher delivery to preserve the emphasis.
        if (/\b[A-Z]{2,}\b/.test(text)) {
            rateHint  = 0.85;
            pitchHint = 1.15;
            text = text.replace(/\b([A-Z]{2,})\b/g, w => w.toLowerCase());
        }

        return { text, rateHint, pitchHint };
    }

    function _buildTTSItem(username, messageText) {
        let text = String(messageText || "").trim();
        if (!text) return null;
        if (settings.ttsSkipUrls) text = text.replace(/https?:\/\/\S+/gi, "[link]").trim();
        // Preprocessing: laugh replacements, greentext pauses, CAPS normalisation
        const { text: ppText, rateHint, pitchHint } = _preprocessTTSText(text);
        text = ppText.replace(/\.{3,}|\u2026/g, " ellipsis ").replace(/\s{2,}/g, " ").trim();
        if (!text) return null;
        const phrase = (settings.ttsSpeakUsername && username) ? `${username} says: ${text}` : text;
        const key = username ? username.toLowerCase() : null;
        const userVoices = settings.ttsUserVoices || {};
        let userCfg = key ? (userVoices[key] || null) : null;
        if (!userCfg && key && settings.ttsAutoAssignVoice && window.speechSynthesis) {
            const allVoices = window.speechSynthesis.getVoices();
            if (allVoices.length) {
                const pool = allVoices.length > 1
                    ? allVoices.filter(v => v.name !== settings.ttsVoice)
                    : allVoices;
                const picked = pool[Math.floor(Math.random() * pool.length)];
                userCfg = { voice: picked.name, pitch: 1.0, rate: 1.0 };
            }
            if (userCfg) {
                const uv = Object.assign({}, settings.ttsUserVoices);
                uv[key] = userCfg;
                settings.ttsUserVoices = uv;
                saveSettings();
                renderTTSUserVoiceList();
            }
        }
        const perUserVoice = (userCfg && typeof userCfg === "object") ? (userCfg.voice || "") : (typeof userCfg === "string" ? userCfg : "");
        const perUserPitch = (userCfg && typeof userCfg === "object" && typeof userCfg.pitch === "number") ? userCfg.pitch : null;
        const perUserRate  = (userCfg && typeof userCfg === "object" && typeof userCfg.rate  === "number") ? userCfg.rate  : null;
        // Apply hint multipliers on top of per-user or global rate/pitch
        const finalRate  = (perUserRate  !== null ? perUserRate  : (typeof settings.ttsRate  === "number" ? settings.ttsRate  : 1.0)) * rateHint;
        const finalPitch = (perUserPitch !== null ? perUserPitch : (typeof settings.ttsPitch === "number" ? settings.ttsPitch : 1.0)) * pitchHint;
        return { text: phrase, voiceName: perUserVoice, pitch: finalPitch, rate: finalRate, speakerKey: key || "__global__" };
    }

    function speakTTS(username, messageText) {
        if (!settings.ttsEnabled) return;
        if (!ttsReady) return;
        if (!window.speechSynthesis) return;
        const item = _buildTTSItem(username, messageText);
        if (!item) return;
        _dispatchTTSItem(item);
    }

    function populateTTSVoices() {
        if (!window.speechSynthesis) return;
        const voices = window.speechSynthesis.getVoices();
        // Group: Google voices first, then everything else
        const google = voices.filter(v => v.name.startsWith("Google"));
        const others = voices.filter(v => !v.name.startsWith("Google"));
        let voiceOpts = '<option value="">Default</option>';
        if (google.length) {
            voiceOpts += '<optgroup label="Google voices">'
                + google.map(v => `<option value="${v.name}">${v.name} (${v.lang})</option>`).join("")
                + '</optgroup>';
        }
        if (others.length) {
            voiceOpts += '<optgroup label="Browser voices">'
                + others.map(v => `<option value="${v.name}">${v.name} (${v.lang})</option>`).join("")
                + '</optgroup>';
        }
        const sel = document.getElementById("ep-tts-voice-select");
        if (sel) {
            sel.innerHTML = voiceOpts;
            sel.value = settings.ttsVoice || "";
            sel.onchange = () => { settings.ttsVoice = sel.value; saveSettings(); };
        }
        const uvSel = document.getElementById("ep-tts-uv-voice");
        if (uvSel) uvSel.innerHTML = voiceOpts;
        renderTTSUserVoiceList();
    }

    function renderTTSUserVoiceList() {
        const container = document.getElementById("ep-tts-user-list");
        if (!container) return;
        const userVoices = settings.ttsUserVoices || {};
        const entries = Object.entries(userVoices);
        if (!entries.length) {
            container.innerHTML = '<span style="color:#555;font-size:12px;">No per-user voices set.</span>';
            return;
        }
        container.innerHTML = entries.map(([user, cfg]) => {
            const voice = (cfg && typeof cfg === "object") ? (cfg.voice || "Default") : (cfg || "Default");
            const pitch = (cfg && typeof cfg === "object" && typeof cfg.pitch === "number") ? cfg.pitch : 1.0;
            const rate  = (cfg && typeof cfg === "object" && typeof cfg.rate  === "number") ? cfg.rate  : 1.0;
            return `<div style="display:flex;align-items:center;gap:6px;background:#1a1a1a;border-radius:6px;padding:4px 8px;flex-wrap:wrap;">`
                + `<span style="font-size:12px;color:#e8e8e8;min-width:70px;">${escapeHTML(user)}</span>`
                + `<span style="font-size:11px;color:#888;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${escapeHTML(String(voice))}">${escapeHTML(String(voice))}</span>`
                + `<span style="font-size:11px;color:#666;white-space:nowrap;">×${rate.toFixed(2)} ♪${pitch.toFixed(2)}</span>`
                + `<button class="ep-msg-btn ep-tts-uv-remove" data-user="${escapeHTML(user)}" style="font-size:13px;line-height:1;padding:2px 6px;border-radius:4px;">&#x2715;</button>`
                + `</div>`;
        }).join("");
        container.querySelectorAll(".ep-tts-uv-remove").forEach(btn => {
            btn.addEventListener("click", () => {
                const u = btn.dataset.user;
                const uv = Object.assign({}, settings.ttsUserVoices);
                delete uv[u];
                settings.ttsUserVoices = uv;
                saveSettings();
                renderTTSUserVoiceList();
            });
        });
    }

    function applyCustomCSS() {
        const id = 'ep-custom-css';
        let el = document.getElementById(id);
        if (!el) { el = document.createElement('style'); el.id = id; document.head.appendChild(el); }
        el.textContent = settings.customCSS || '';
    }

    function rebuildPanel() {
        if (panelEl) panelEl.remove();
        panelEl = null;
        createPanel();
    }

    function openPanel() {
        if (!panelEl) createPanel();
        panelEl.classList.remove('hidden');
    }
    function closePanel() {
        if (panelEl) panelEl.classList.add('hidden');
    }
    function togglePanel() {
        if (!panelEl || panelEl.classList.contains('hidden')) openPanel();
        else closePanel();
    }

    function onSettingChanged(key, val) {
        switch (key) {
            case 'chatReskin':
            case 'chatAccentColor':
            case 'chatAccentColor2':
            case 'chatOpacity':
            case 'chatBlur':
            case 'chatFontSize':
            case 'compactMode':
            case 'messageBubbleStyle':
            case 'accentGlow':
            case 'selfHighlight':
            case 'myUsername':
            case 'showTimestamps':
            case 'chatFont':
            case 'chatFontCustomUrl':
                applyReskinCSS();
                break;
            case 'showMsgContext':
                document.body.classList.toggle('ep-hide-ctx', !val);
                break;
            case 'threadingEnabled':
                document.body.classList.toggle('ep-threading', !!val);
                break;
            case 'mentionSound':
                break; // handled in processNewMessage
            case 'showCatboxStatus':
                updateHostStatus();
                break;
            case 'fixEvidenceStretch':
                updateEvidenceFix();
                break;
            case 'autoScroll':
                autoScrollEnabled = val;
                if (val) updateScrollPausedIndicator(); // only hide indicator when re-enabling; don't show it when toggling off via settings
                break;
            case 'showClock':
            case 'clockFormat24h':
                initClock();
                break;
            case 'showNowPlaying':
                if (!val && nowPlayingEl) nowPlayingEl.classList.remove('visible');
                break;
            case 'backgroundEnabled':
            case 'backgroundPreset':
            case 'backgroundCustomUrl':
            case 'backgroundDim':
            case 'backgroundBlur':
                applyBackground();
                break;
            case 'notificationSoundUrl':
            case 'notificationSoundVolume':
                notificationSound.setAudio(settings.notificationSoundUrl, settings.notificationSoundVolume);
                break;
            case 'topBarStyle':
            case 'topBarBg':
            case 'topBarBg2':
            case 'topBarTextColor':
            case 'topBarBlur':
            case 'topBarBorderBottom':
            case 'topBarShowStats':
            case 'ownMsgBg':
            case 'mentionBg':
            case 'msgHoverBg':
            case 'linkColor':
            case 'uiBorderRadius':
            case 'scrollbarWidth':
            case 'scrollbarColor':
            case 'chatPattern':
            case 'chatPatternColor':
            case 'chatPatternOpacity':
                applyReskinCSS();
                break;
            case 'customCSS':
                applyCustomCSS();
                break;
            case 'ttsEnabled':
                if (!val) { ttsQueue = []; _cancelActive(); }
                break;
        }
    }

    // ─── Status bar & indicators ────────────────────────────────────────────────
    let statusBarEl = null;
    let msgCount = 0;

    function createStatusBar() {
        // Stats are now rendered inline in #ep-top-cover;
        // keep statusBarEl as a hidden sentinel so updateStatusBar's guard passes.
        statusBarEl = document.createElement('div');
        statusBarEl.id = 'ep-statusbar';
        statusBarEl.style.display = 'none';
        document.body.appendChild(statusBarEl);
    }

    let cachedUserCount = '';
    let lastUserCountScan = 0;

    function updateStatusBar() {
        if (!statusBarEl) return;
        const m = document.getElementById('ep-stat-msgs');
        if (m) m.textContent = msgCount;
        const u = document.getElementById('ep-stat-users');
        if (u) u.textContent = getNativeUserCountCached() || '?';
    }

    function getNativeUserCountCached() {
        const now = Date.now();
        if (now - lastUserCountScan < 3000) return cachedUserCount;
        lastUserCountScan = now;
        cachedUserCount = getNativeUserCountFast();
        return cachedUserCount;
    }

    function getNativeUserCountFast() {
        const labels = [...document.querySelectorAll('[aria-label], [title]')].slice(0, 150);
        for (const el of labels) {
            if (el.closest('#ep-statusbar') || el.closest('#ep-panel') || el.closest('#ep-courtroom-bar') || el.closest('#ep-top-cover')) continue;
            const label = ((el.getAttribute('aria-label') || '') + ' ' + (el.title || '')).toLowerCase();
            if (!/user|people|participant|member|online|viewer/.test(label)) continue;
            const text = (el.textContent || '').trim();
            const m = text.match(/\b(\d{1,3})\b/);
            if (m) return m[1];
        }
        const top = (document.body?.innerText || '').slice(0, 800);
        return top.match(/(?:^|\n)\s*(\d{1,3})\s+0\s*(?:\n|$)/)?.[1] || '';
    }
    // Auto-scroll
    let autoScrollEnabled = true;
    let scrollPausedEl = null;

    function createScrollPausedIndicator() {
        scrollPausedEl = document.createElement('div');
        scrollPausedEl.id = 'ep-scroll-paused';
        scrollPausedEl.textContent = '▼ Scroll Paused — Click to Resume';
        scrollPausedEl.addEventListener('click', () => {
            autoScrollEnabled = true;
            settings.autoScroll = true;
            saveSettings();
            updateScrollPausedIndicator();
            scrollToBottom();
        });
        document.body.appendChild(scrollPausedEl);
    }

    function updateScrollPausedIndicator() {
        if (!scrollPausedEl) return;
        scrollPausedEl.style.display = autoScrollEnabled ? 'none' : 'block';
    }

    // Mention toast
    let mentionToastEl = null;
    let mentionToastTimer = null;

    function createMentionToast() {
        mentionToastEl = document.createElement('div');
        mentionToastEl.id = 'ep-mention-toast';
        document.body.appendChild(mentionToastEl);
    }

    function showMentionToast(from, text) {
        if (!mentionToastEl) return;
        mentionToastEl.innerHTML = `<strong style="color:#5ab4ff;">@mention</strong> from <strong>${escapeHTML(from)}</strong><br><span style="color:#999;font-size:12px;">${escapeHTML(text.slice(0, 80))}</span>`;
        mentionToastEl.style.display = 'block';
        if (mentionToastTimer) clearTimeout(mentionToastTimer);
        mentionToastTimer = setTimeout(() => { mentionToastEl.style.display = 'none'; }, 5000);
    }

    function showHighlightToast(from, text) {
        if (!mentionToastEl) return;
        mentionToastEl.innerHTML = `<strong style="color:var(--ep-accent,#e05a2b);">highlight</strong>${from ? ` from <strong>${escapeHTML(from)}</strong>` : ''}<br><span style="color:#999;font-size:12px;">${escapeHTML(text.slice(0, 100))}</span>`;
        mentionToastEl.style.display = 'block';
        if (mentionToastTimer) clearTimeout(mentionToastTimer);
        mentionToastTimer = setTimeout(() => { mentionToastEl.style.display = 'none'; }, 5000);
    }

    // Generic toast
    function showToast(msg) {
        const t = document.createElement('div');
        Object.assign(t.style, {
            position: 'fixed', bottom: '50px', left: '50%', transform: 'translateX(-50%)',
            background: '#1c1c1c', color: '#ccc', border: '1px solid #2a2a2a',
            borderRadius: '8px', padding: '8px 18px', fontSize: '12px',
            zIndex: '99999', boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
            pointerEvents: 'none', transition: 'opacity .3s',
        });
        t.textContent = msg;
        document.body.appendChild(t);
        setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 350); }, 2200);
    }

    // ─── Chat Search ────────────────────────────────────────────────────────────
    let searchOverlayEl = null;
    let searchMatches = [];
    let searchIdx = 0;

    function createSearchOverlay() {
        searchOverlayEl = document.createElement('div');
        searchOverlayEl.id = 'ep-search-overlay';
        searchOverlayEl.innerHTML = `
            <input id="ep-search-input" placeholder="Search chat…" autocomplete="off">
            <span id="ep-search-count"></span>
            <button class="ep-btn secondary" id="ep-search-prev" style="padding:4px 8px;font-size:11px;">▲</button>
            <button class="ep-btn secondary" id="ep-search-next" style="padding:4px 8px;font-size:11px;">▼</button>
            <button class="ep-btn secondary" id="ep-search-close" style="padding:4px 8px;font-size:11px;">✕</button>
        `;
        document.body.appendChild(searchOverlayEl);

        const inp = searchOverlayEl.querySelector('#ep-search-input');
        inp.addEventListener('input', () => runChatSearch(inp.value));
        searchOverlayEl.querySelector('#ep-search-prev').addEventListener('click', () => stepSearch(-1));
        searchOverlayEl.querySelector('#ep-search-next').addEventListener('click', () => stepSearch(1));
        searchOverlayEl.querySelector('#ep-search-close').addEventListener('click', closeSearch);
    }

    function openSearch() {
        if (!searchOverlayEl) createSearchOverlay();
        searchOverlayEl.classList.add('visible');
        searchOverlayEl.querySelector('#ep-search-input').focus();
    }

    function closeSearch() {
        if (!searchOverlayEl) return;
        searchOverlayEl.classList.remove('visible');
        clearSearchHighlights();
        searchOverlayEl.querySelector('#ep-search-input').value = '';
    }

    function runChatSearch(query) {
        clearSearchHighlights();
        searchMatches = [];
        if (!query.trim()) { updateSearchCount(); return; }

        const items = document.querySelectorAll('#ep-chat-list > li');
        const q = query.toLowerCase();
        items.forEach(li => {
            if (li.textContent.toLowerCase().includes(q)) {
                li.classList.add('ep-search-match');
                searchMatches.push(li);
            }
        });
        searchIdx = 0;
        updateSearchCount();
        if (searchMatches.length) searchMatches[0].scrollIntoView({ block: 'center' });
    }

    function stepSearch(dir) {
        if (!searchMatches.length) return;
        searchIdx = (searchIdx + dir + searchMatches.length) % searchMatches.length;
        updateSearchCount();
        searchMatches[searchIdx].scrollIntoView({ block: 'center' });
    }

    function clearSearchHighlights() {
        document.querySelectorAll('.ep-search-match').forEach(el => el.classList.remove('ep-search-match'));
    }

    function updateSearchCount() {
        const c = document.getElementById('ep-search-count');
        if (c) c.textContent = searchMatches.length ? `${searchIdx + 1}/${searchMatches.length}` : '0';
    }

    // ─── Evidence Fix ───────────────────────────────────────────────────────────
    function updateEvidenceFix() {
        let s = document.getElementById('ep-evidence-fix');
        if (!s) { s = document.createElement('style'); s.id = 'ep-evidence-fix'; document.head.appendChild(s); }
        s.textContent = settings.fixEvidenceStretch ? `img[alt="Evidence"] { object-fit: contain !important; }` : '';
    }

    // ─── Notification Sound ─────────────────────────────────────────────────────
    const DEFAULT_NOTIFICATION_SOUND = 'https://cdn.freesound.org/previews/256/256113_4772965-lq.mp3';

    const notificationSound = {
        ctx: null, buffer: null, volume: 0.5, seek: 0, duration: 0,
        lastPlayed: 0, cooldown: 1500,

        getCtx() {
            if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            return this.ctx;
        },

        setAudio(url, volume) {
            this.volume = volume ?? 0.5;
            this.seek = (settings.notificationSoundSeek || 0);
            this.duration = (settings.notificationSoundDuration || 0);
            const target = url || DEFAULT_NOTIFICATION_SOUND;
            const ctx = this.getCtx();
            gmRequest({
                method: 'GET', url: target, responseType: 'arraybuffer',
                onload: r => { ctx.decodeAudioData(r.response, buf => { this.buffer = buf; }); },
                onerror: () => { console.warn('[Enhancer+] Could not load notification sound'); }
            });
        },

        play() {
            if (!this.buffer) return;
            if (Date.now() - this.lastPlayed < this.cooldown) return;
            this.lastPlayed = Date.now();
            const ctx = this.getCtx();
            const src = ctx.createBufferSource();
            const gain = ctx.createGain();
            src.buffer = this.buffer;
            gain.gain.value = this.volume;
            src.connect(gain).connect(ctx.destination);
            src.start(0, this.seek / 1000);
            if (this.duration) src.stop(ctx.currentTime + this.duration / 1000);
        }
    };

    // ─── Sound Effects ─────────────────────────────────────────────
    let sfxCooldowns = {};
    let laughTrackLastPlayed = 0;
    let laughTrackLastIndex = -1;

    function playSFX(url, key) {
        if (!url) return;
        const now = Date.now();
        if (key && sfxCooldowns[key] && now - sfxCooldowns[key] < 1500) return;
        if (key) sfxCooldowns[key] = now;
        try {
            const a = new Audio(url);
            a.volume = Math.max(0, Math.min(1, settings.sfxVolume ?? 0.8));
            a.play().catch(() => {});
        } catch {}
    }


    // ─── Hover embed system ─────────────────────────────────────────────────────
    let hoverEl = null;
    let hoverTimer = null;

    function getOrCreateHover() {
        if (!hoverEl) {
            hoverEl = document.createElement('div');
            hoverEl.id = 'ep-hover';
            hoverEl.innerHTML = `<div id="ep-hover-header">
                <button id="ep-hover-close" title="Close with Esc">ESC</button>
            </div>`;
            hoverEl.style.display = 'none';
            document.body.appendChild(hoverEl);

            hoverEl.querySelector('#ep-hover-close').addEventListener('click', clearHover);
        }
        return hoverEl;
    }

    function clearHover() {
        if (hoverTimer) { clearTimeout(hoverTimer); hoverTimer = null; }
        if (!hoverEl) return;
        hoverEl.style.display = 'none';
        hoverEl.classList.remove('audio-hover');
        const h = hoverEl.querySelector('#ep-hover-header');
        while (hoverEl.children.length > 1) hoverEl.lastChild.remove();
        hoverEl.appendChild(h);
    }

    function showHoverContent(content) {
        const el = getOrCreateHover();
        const h = el.querySelector('#ep-hover-header');
        while (el.children.length > 1) el.lastChild.remove();
        el.style.display = 'flex';
        el.classList.toggle('audio-hover', content.tagName === 'AUDIO');
        el.appendChild(h);
        el.appendChild(content);
    }

    function buildHoverEmbed(url) {
        const ytMatch = url.match(YOUTUBE_RE);
        const twMatch = url.match(TWITTER_RE);
        const ext = url.split('?')[0].split('.').pop().toLowerCase();

        if (ytMatch && settings.youtubeHoverPopup) {
            const iframe = document.createElement('iframe');
            iframe.src = `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&mute=0`;
            iframe.width = '640'; iframe.height = '360';
            iframe.allow = 'autoplay; encrypted-media; picture-in-picture';
            iframe.style.cssText = 'border:none;border-radius:10px;max-width:72vw;max-height:78vh;';
            return iframe;
        }
        if (twMatch && settings.twitterHoverPopup) {
            const loading = document.createElement('div');
            loading.className = 'ep-embed-text';
            loading.textContent = 'Loading tweet…';
            showHoverContent(loading);
            gmRequest({
                method: 'GET',
                url: `https://api.fxtwitter.com/status/${twMatch[1]}`,
                responseType: 'json',
                onload: r => {
                    const data = r.response?.tweet;
                    if (!data) return;
                    const imgs = data.media?.all?.filter(m => m.type === 'photo') || [];
                    const vids = data.media?.all?.filter(m => m.type === 'video' || m.type === 'gif' || m.type === 'animated_gif') || [];
                    const text = document.createElement('div');
                    text.className = 'ep-embed-text';
                    text.innerHTML = `<div style="padding:8px;font-size:13px;color:#ccc;max-width:520px;text-align:left;">
                        <strong style="color:#5ab4ff;">@${escapeHTML(data.author?.screen_name || '')}</strong><br>
                        <span>${escapeHTML(data.text || '')}</span>
                        <div style="margin-top:6px;font-size:11px;color:#555;">${data.created_at || ''}</div>
                    </div>`;
                    const wrap = document.createElement('div');
                    wrap.style.cssText = 'display:flex;flex-direction:column;gap:4px;';
                    const hoverGifVids = [];
                    if (imgs.length || vids.length) {
                        const grid = document.createElement('div');
                        grid.className = 'ep-embed-grid';
                        imgs.forEach(img => { const i = document.createElement('img'); i.src = img.url; grid.appendChild(i); });
                        vids.forEach(vid => {
                            const v = document.createElement('video');
                            const isGif = vid.type === 'gif' || vid.type === 'animated_gif';
                            v.controls = true; v.playsInline = true;
                            if (isGif) { v.autoplay = true; v.loop = true; v.muted = true; hoverGifVids.push(v); }
                            grid.appendChild(v);
                            // load via blob to bypass any media-src CSP restrictions
                            loadVideoViaBlobOrDirect(v, pickTwitterVideoUrl(vid) || vid.url || '', isGif);
                        });
                        wrap.appendChild(grid);
                    }
                    wrap.appendChild(text);
                    showHoverContent(wrap);
                    hoverGifVids.forEach(v => v.play().catch(() => {}));
                }
            });
            return loading;
        }
        const tenorMatch = url.match(TENOR_RE);
        if (tenorMatch && settings.tenorHoverPopup) {
            const loading = document.createElement('div');
            loading.className = 'ep-embed-text';
            loading.textContent = 'Loading GIF…';
            showHoverContent(loading);
            const vidStyle = 'max-width:72vw;max-height:78vh;border-radius:8px;box-shadow:0 8px 32px rgba(0,0,0,0.6);';

            function showTenorHover(mp4Url, fallbackImg) {
                if (mp4Url) {
                    const vid = document.createElement('video');
                    vid.autoplay = true; vid.loop = true; vid.muted = true;
                    vid.playsInline = true; vid.style.cssText = vidStyle;
                    vid.addEventListener('error', () => {
                        if (fallbackImg) { const img = document.createElement('img'); img.src = fallbackImg; img.style.cssText = vidStyle; showHoverContent(img); }
                        else { loading.textContent = 'Could not load GIF.'; }
                    }, { once: true });
                    vid.src = mp4Url;
                    showHoverContent(vid);
                    vid.play().catch(() => {});
                } else if (fallbackImg) {
                    const img = document.createElement('img');
                    img.src = fallbackImg; img.style.cssText = vidStyle;
                    showHoverContent(img);
                } else {
                    loading.textContent = 'Could not load GIF.';
                }
            }

            // Strategy 1: page fetch for og:video
            gmRequest({
                method: 'GET', url,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Sec-Fetch-Mode': 'navigate'
                },
                onload: r => {
                    const html = r.responseText || '';
                    const ogVideoM =
                        html.match(/<meta[^>]+property=["']og:video(?::(?:secure_)?url)?["'][^>]+content=["']([^"']+)["']/i) ||
                        html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:video(?::(?:secure_)?url)?["']/i) ||
                        html.match(/["']contentUrl["']\s*:\s*["']([^"']+\.mp4[^"']*)/i);
                    const ogImageM =
                        html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
                        html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
                    const mp4Url = ogVideoM?.[1] || null;
                    const fallbackImg = ogImageM?.[1] || null;
                    if (mp4Url) {
                        showTenorHover(mp4Url, fallbackImg);
                    } else {
                        // Strategy 2: oEmbed fallback
                        gmRequest({
                            method: 'GET',
                            url: `https://tenor.com/oembed?url=${encodeURIComponent(url)}&format=json`,
                            responseType: 'json',
                            onload: r2 => {
                                const thumb = r2.response?.thumbnail_url;
                                const hashM = thumb?.match(/media\.tenor\.com\/([^/?#]+)\//);
                                const slugM = url.match(/tenor\.com\/view\/([\w-]+)/);
                                const derivedMp4 = (hashM && slugM) ? `https://media.tenor.com/${hashM[1]}/${(thumb?.match(/\/([^\/?.]+)\.[\w]+(?:[?#]|$)/) || [,''])[1] || slugM?.[1] || ''}.mp4` : null;
                                showTenorHover(derivedMp4, thumb);
                            },
                            onerror: () => { loading.textContent = 'Could not load GIF.'; }
                        });
                    }
                },
                onerror: () => {
                    gmRequest({
                        method: 'GET',
                        url: `https://tenor.com/oembed?url=${encodeURIComponent(url)}&format=json`,
                        responseType: 'json',
                        onload: r2 => {
                            const thumb = r2.response?.thumbnail_url;
                            const hashM = thumb?.match(/media\.tenor\.com\/([^/?#]+)\//);
                            const slugM = url.match(/tenor\.com\/view\/([\w-]+)/);
                            const derivedMp4 = (hashM && slugM) ? `https://media.tenor.com/${hashM[1]}/${(thumb?.match(/\/([^\/?.]+)\.[\w]+(?:[?#]|$)/) || [,''])[1] || slugM?.[1] || ''}.mp4` : null;
                            showTenorHover(derivedMp4, thumb);
                        },
                        onerror: () => { loading.textContent = 'Could not load GIF.'; }
                    });
                }
            });
            return loading;
        }
        const klipyHoverMatch = url.match(KLIPY_RE);
        if (klipyHoverMatch && settings.klipyHoverPopup) {
            const loading = document.createElement('div');
            loading.className = 'ep-embed-text';
            loading.textContent = 'Loading GIF…';
            showHoverContent(loading);
            const vidStyle = 'max-width:72vw;max-height:78vh;border-radius:8px;box-shadow:0 8px 32px rgba(0,0,0,0.6);';
            function showKlipyHover(mp4Url, fallbackImg) {
                if (mp4Url) {
                    const vid = document.createElement('video');
                    vid.autoplay = true; vid.loop = true; vid.muted = true;
                    vid.playsInline = true; vid.style.cssText = vidStyle;
                    vid.addEventListener('error', () => {
                        if (fallbackImg) { const img = document.createElement('img'); img.src = fallbackImg; img.style.cssText = vidStyle; showHoverContent(img); }
                        else { loading.textContent = 'Could not load GIF.'; }
                    }, { once: true });
                    vid.src = mp4Url;
                    showHoverContent(vid);
                    vid.play().catch(() => {});
                } else if (fallbackImg) {
                    const img = document.createElement('img');
                    img.src = fallbackImg; img.style.cssText = vidStyle;
                    showHoverContent(img);
                } else {
                    loading.textContent = 'Could not load GIF.';
                }
            }
            let hoverResolved = false;
            // Strategy 1: API call (reliable, if key is available)
            const klipyApiKey = getKlipyKey();
            const slugM = url.match(/klipy\.com\/gifs\/([\w-]+)/i);
            if (gmRequest && klipyApiKey && slugM) {
                const q = slugM[1].replace(/-\d+$/, '').replace(/-/g, ' ');
                gmRequest({
                    method: 'GET',
                    url: `https://api.klipy.com/api/v1/${klipyApiKey}/gifs/search?q=${encodeURIComponent(q)}&page=1&per_page=24&customer_id=beop`,
                    headers: { 'Accept': 'application/json' },
                    responseType: 'json',
                    onload: r => {
                        if (hoverResolved) return;
                        const items = r.response?.data?.data;
                        if (!Array.isArray(items) || !items.length) return;
                        // Only accept an exact slug match; otherwise let the
                        // HTML scrape fallback resolve the correct media.
                        const match = klipyFindBySlug(items, slugM[1]);
                        if (!match) return;
                        const mp4  = klipyFileUrl(match, ['mp4'], ['hd', 'md', 'sm']);
                        const anim = klipyFileUrl(match, ['gif', 'webp'], ['hd', 'md', 'sm']);
                        if (mp4 || anim) {
                            hoverResolved = true;
                            showKlipyHover(mp4, anim);
                        }
                    },
                    onerror: () => {}
                });
            }
            // Strategy 2: HTML scrape fallback (works if Cloudflare doesn't block)
            if (gmRequest) {
                gmRequest({
                    method: 'GET', url,
                    headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'text/html', 'Sec-Fetch-Mode': 'navigate' },
                    onload: r => {
                        if (hoverResolved) return;
                        const html = r.responseText || '';
                        const ogVideoM =
                            html.match(/<meta[^>]+property=["']og:video(?::(?:secure_)?url)?["'][^>]+content=["']([^"']+)["']/i) ||
                            html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:video(?::(?:secure_)?url)?["']/i) ||
                            html.match(/["']contentUrl["']\s*:\s*["']([^"']+\.mp4[^"']*)/i);
                        const ogImageM =
                            html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
                            html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
                        const cdnVideoM = html.match(/https:\\?\/\\?\/static\.klipy\.com\\?\/[^\s"'\\]+\.(?:mp4|webm|gif)/i);
                        const cdnImgM   = html.match(/https:\\?\/\\?\/static\.klipy\.com\\?\/[^\s"'\\]+\.(?:webp|jpg|png)/i);
                        const clean = s => s ? s.replace(/\\+\//g, '/') : null;
                        const mp4 = ogVideoM?.[1] || clean(cdnVideoM?.[0]) || null;
                        const img = ogImageM?.[1] || clean(cdnImgM?.[0]) || null;
                        if (mp4 || img) {
                            hoverResolved = true;
                            showKlipyHover(mp4, img);
                        }
                    },
                    onerror: () => {}
                });
            }
            // Final fallback: show error after 6s if neither strategy resolved
            setTimeout(() => {
                if (!hoverResolved) { loading.textContent = 'Could not load GIF.'; }
            }, 6000);
            return loading;
        }
        const chanMatch = url.match(CHAN_RE);
        if (chanMatch && settings.fourchanHoverPopup) {
            const loading = document.createElement('div');
            loading.className = 'ep-embed-text';
            loading.textContent = 'Loading post…';
            showHoverContent(loading);
            const board = chanMatch[1], thread = chanMatch[2], postId = chanMatch[3];
            gmRequest({
                method: 'GET',
                url: `https://a.4cdn.org/${board}/thread/${thread}.json`,
                responseType: 'json',
                onload: r => {
                    const posts = r.response?.posts;
                    if (!posts?.length) { loading.textContent = 'Could not load post.'; return; }
                    const post = postId ? (posts.find(p => String(p.no) === postId) || posts[0]) : posts[0];
                    if (!post) { loading.textContent = 'Post not found.'; return; }
                    const wrap = document.createElement('div');
                    wrap.style.cssText = 'display:flex;flex-direction:column;gap:6px;max-width:480px;';
                    if (post.tim && post.ext) {
                        const img = document.createElement('img');
                        img.src = `https://i.4cdn.org/${board}/${post.tim}${post.ext}`;
                        img.style.cssText = 'max-width:100%;max-height:340px;object-fit:contain;border-radius:6px;background:#050505;';
                        wrap.appendChild(img);
                    }
                    const textEl = document.createElement('div');
                    textEl.className = 'ep-embed-text';
                    const name = escapeHTML(post.name || 'Anonymous');
                    const comment = (post.com || '').replace(/<[^>]+>/g, '');
                    textEl.innerHTML = `<div style="text-align:left;padding:4px 0">
                        <strong style="color:#789922;">${name}</strong>
                        <span style="color:#555;font-size:10px;margin-left:6px;">No.${post.no}</span>
                        ${post.sub ? `<div style="color:#af0a0f;font-weight:700;margin:3px 0">${escapeHTML(post.sub)}</div>` : ''}
                        <div style="margin-top:4px;color:#ccc;">${escapeHTML(comment).slice(0, 400)}${comment.length > 400 ? '…' : ''}</div>
                    </div>`;
                    wrap.appendChild(textEl);
                    showHoverContent(wrap);
                },
                onerror: () => { loading.textContent = 'Could not load post.'; }
            });
            return loading;
        }
        const ttMatch = url.match(TIKTOK_RE);
        if (ttMatch) {
            const iframe = document.createElement('iframe');
            iframe.src = `https://www.tiktok.com/embed/v2/${ttMatch[1]}`;
            iframe.allow = 'autoplay; encrypted-media; picture-in-picture';
            iframe.allowFullscreen = true;
            iframe.style.cssText = 'border:none;border-radius:12px;width:340px;height:740px;max-width:90vw;max-height:82vh;';
            return iframe;
        }
        if ((FOURCHAN_MEDIA_RE.test(url) || B4K_RE.test(url) || SEVENTV_RE.test(url) || IMAGE_EXT.test(url)) && settings.imageHoverPopup) {
            const img = document.createElement('img');
            img.style.cssText = 'max-width:72vw;max-height:78vh;border-radius:8px;box-shadow:0 8px 32px rgba(0,0,0,0.6);';
            if (FOURCHAN_MEDIA_RE.test(url) || B4K_RE.test(url)) {
                loadImageViaBlob(img, url);
            } else {
                img.src = url;
            }
            return img;
        }
        if (VIDEO_EXT.test(url) && settings.videoHoverPopup) {
            const vid = document.createElement('video');
            vid.src = url; vid.controls = true; vid.autoplay = true;
            vid.style.cssText = 'max-width:72vw;max-height:78vh;border-radius:8px;box-shadow:0 8px 32px rgba(0,0,0,0.6);';
            return vid;
        }
        if (AUDIO_EXT.test(url) && settings.audioHoverPopup) {
            const aud = document.createElement('audio');
            aud.src = url; aud.controls = true; aud.autoplay = true;
            return aud;
        }
        return null;
    }

    function attachHoverEvents(anchor) {
        anchor.addEventListener('mouseenter', ev => {
            // Don't show hover popup when the cursor is over an inline media element
            // (those use click-to-fullscreen instead).
            if (ev.target.classList.contains('ep-inline-img')) return;
            clearTimeout(hoverTimer);
            hoverTimer = setTimeout(() => {
                const content = buildHoverEmbed(anchor.href);
                if (content) showHoverContent(content);
            }, 250);
        });
        anchor.addEventListener('mouseleave', ev => {
            if (ev.target.classList.contains('ep-inline-img')) return;
            clearTimeout(hoverTimer);
            if (hoverEl?.classList.contains('audio-hover')) return;
            hoverTimer = setTimeout(clearHover, 350);
        });
    }

    // ─── Chat processing ─────────────────────────────────────────────────────────
    let chatListEl = null;
    let chatObserver = null;
    let scrollAnchor = null;
    let isUserScrolling = false;
    let cachedScroller = null;  // cached once found so both places agree
    const recentMessageContexts = [];
    const userSides = {};        // username.lower → 'left'|'right'
    const userOrder = [];        // order of first appearance → fallback side
    const activeFramePopups = {}; // username.lower → popup element

    // Walk up the DOM via COMPUTED styles — never inline styles (MUI uses classes).
    // We do NOT gate on scrollHeight > clientHeight: the container can be empty
    // at the moment startChatObserver runs, which would cause findScroller to
    // return null and attach the scroll-pause listener to the wrong element.
    function findScroller(el) {
        let node = el ? el.parentElement : null;
        while (node && node !== document.documentElement) {
            const cs = window.getComputedStyle(node);
            const oy = cs.overflowY;
            if (oy === 'auto' || oy === 'scroll') return node;
            node = node.parentElement;
        }
        return null;
    }

    // Returns the cached scroller (re-validates each call in case DOM changed).
    function getOrFindScroller() {
        if (cachedScroller?.isConnected) return cachedScroller;
        const found = findScroller(chatListEl);
        if (found) cachedScroller = found;
        return found || chatListEl?.parentElement || null;
    }

    function scrollToBottom() {
        if (!chatListEl) return;
        // Keep anchor pinned to the very end of the list
        if (scrollAnchor && scrollAnchor.parentElement === chatListEl) {
            chatListEl.appendChild(scrollAnchor);
        }
        requestAnimationFrame(() => {
            // Strategy A — scrollIntoView: browser-native, finds the right
            // ancestor regardless of what getOrFindScroller returns.
            if (scrollAnchor?.isConnected) {
                scrollAnchor.scrollIntoView({ block: 'end', behavior: 'instant' });
            }
            // Strategy B — direct scrollTop: handles containers where
            // scrollIntoView is blocked by an outer overflow:hidden wrapper.
            const scroller = getOrFindScroller();
            if (scroller) scroller.scrollTop = scroller.scrollHeight + 9999;
        });
    }

    function getMessageBodyText(li, usernameEl) {
        // objection.lol uses a MUI Discord-style layout: username is in the
        // "primary" ListItemText span, message body in the "secondary" one.
        // Grab the secondary element directly when available — it avoids all the
        // cloning / stripping complexity and gives a clean message string.
        const secondaryEl = li.querySelector(
            '[class*="secondary"], [class*="Secondary"],'
            + '[class*="ListItemText-secondary"], [class*="listItemText-secondary"]'
        );
        if (secondaryEl && usernameEl && secondaryEl !== usernameEl) {
            return (secondaryEl.textContent || '').trim();
        }
        // Fallback: clone the node, strip injected UI and the username element,
        // then return whatever text remains.
        const clone = li.cloneNode(true);
        clone.querySelectorAll('.ep-msg-context, .ep-msg-actions').forEach(el => el.remove());
        if (usernameEl) {
            const usernameText = usernameEl.textContent?.trim();
            [...clone.querySelectorAll(
                'strong, b, [class*="username"], [class*="Username"],'
                + '[class*="primary"], [class*="Primary"]'
            )].forEach(el => {
                if (!usernameText || el.textContent?.trim() === usernameText) el.remove();
            });
        }
        return (clone.textContent || '').trim();
    }

    function getSystemActionType(li) {
        const icon = li.querySelector('svg[data-testid], svg[data-test-id], svg[dataTestid]');
        if (!icon) return null;
        const testId = (icon.dataset?.testid || icon.getAttribute('data-testid') || icon.getAttribute('data-test-id') || '').toString();
        if (/personaddicon/i.test(testId)) return 'join';
        if (/personremoveicon/i.test(testId)) return 'leave';
        if (/handshake|pair|request/i.test(testId)) return 'pair';
        return null;
    }

    function getCommandSfxType(primaryText, fallbackText) {
        const candidate = ((primaryText || '').trim() || (fallbackText || '').trim());
        const cmdMatch = candidate.match(/^(?:[^:\n]{1,48}\s*[:\-]\s*)?!(8ball|roll|dice)\b/i);
        return cmdMatch?.[1]?.toLowerCase() || null;
    }

    // Derive a stable, readable hsl color from a username string
    function hashToUserColor(name) {
        let h = 0;
        for (let i = 0; i < name.length; i++) h = (Math.imul(31, h) + name.charCodeAt(i)) | 0;
        const hue = ((h >>> 0) % 360);
        return `hsl(${hue},62%,64%)`;
    }

    function processNewMessage(li) {
        if (li.dataset.epProcessed) return;
        li.dataset.epProcessed = '1';

        // Extract username and text
        // Broad selector covering semantic names AND MUI ListItemText-primary
        // (objection.lol renders username in the MUI "primary" typography span).
        const usernameEl = li.querySelector(
            'strong, b,'
            + '[class*="username"], [class*="Username"],'
            + '[class*="user-name"], [class*="UserName"],'
            + '[class*="author"], [class*="Author"],'
            + '[class*="nick"], [class*="Nick"],'
            + '[class*="sender"], [class*="Sender"],'
            + '[class*="ListItemText-primary"], [class*="listItemText-primary"],'
            + '[class*="MuiListItemText-primary"]'
        );
        const rawText = li.textContent || '';
        let username = usernameEl?.textContent?.trim() || '';
        // Fallback 1: match against the WebSocket message history — the WS event
        // fires before the DOM updates, so the most recent context entry whose
        // text overlaps this message's text is almost certainly the right one.
        if (!username) {
            const norm = normalizeMsgText(rawText);
            // Scan most-recent-first; skip entries older than 30 s but don't
            // break early — there may be older entries that still match.
            for (let i = recentMessageContexts.length - 1; i >= 0; i--) {
                const ctx = recentMessageContexts[i];
                if (!ctx.userRaw) continue;
                if (Date.now() - ctx.at > 30000) continue;
                if (ctx.text && norm && (norm.includes(ctx.text) || ctx.text.includes(norm.slice(0, 60)))) {
                    username = ctx.userRaw;
                    break;
                }
            }
        }

        // Fallback 2: "Username: message text" split on ': ' (colon + space).
        // We intentionally use ': ' not ':' to avoid splitting on 'https://'.
        if (!username) {
            const colonIdx = rawText.indexOf(': ');
            if (colonIdx > 0 && colonIdx < 48) {
                const candidate = rawText.slice(0, colonIdx).trim();
                if (candidate && !/https?$/i.test(candidate) && !/^\d/.test(candidate) && !/\s/.test(candidate.slice(-1))) {
                    username = candidate;
                }
            }
        }


        let messageText = getMessageBodyText(li, usernameEl) || rawText;

        // Strip any leaked username prefix from the message body. This happens when
        // the DOM query found no username element so getMessageBodyText couldn't
        // remove it (e.g. CSS-generated colon, no matching username element class).
        // Only strip if the result is non-empty to avoid blanking system messages.
        if (username && messageText.startsWith(username)) {
            const stripped = messageText.slice(username.length).replace(/^\s*:?\s*/, '').trim();
            if (stripped.length > 0) messageText = stripped;
        }

        // Per-user accent color (left border + username label color)
        if (username) {
            const uColor = hashToUserColor(username);
            li.setAttribute('data-ep-user', username);
            li.style.setProperty('--ep-user-color', uColor);
        }

        // Timestamp injection
        {
            const now = new Date();
            const hh = String(now.getHours()).padStart(2, '0');
            const mm = String(now.getMinutes()).padStart(2, '0');
            const ts = document.createElement('span');
            ts.className = 'ep-ts';
            ts.textContent = `${hh}:${mm}`;
            ts.setAttribute('aria-hidden', 'true');
            // Insert before first text node or at start of li
            const firstText = li.childNodes[0];
            if (firstText) li.insertBefore(ts, firstText); else li.prepend(ts);
        }

        // Mention sound: fire if our username appears in the message text
        if (settings.mentionSound && settings.myUsername) {
            const myName = settings.myUsername.trim().toLowerCase();
            if (myName && username.toLowerCase() !== myName) {
                // Word-boundary check: "mp" must not match inside "camping"
                let mentionMatched = false;
                try {
                    const mre = new RegExp('(?<![\\w])' + myName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?![\\w])', 'i');
                    mentionMatched = mre.test(messageText);
                } catch (e) {
                    mentionMatched = messageText.toLowerCase().includes(myName);
                }
                if (mentionMatched) notificationSound.play();
            }
        }

        // Blocked users
        const blocked = settings.blockedUsers.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
        if (username && blocked.includes(username.toLowerCase())) {
            li.classList.add('ep-blocked');
            return;
        }

        // Mark the chat list for CSS/search targeting
        if (chatListEl && !chatListEl.id) chatListEl.id = 'ep-chat-list';

        // Process text nodes for linkification + highlights
        processTextNodes(li, username, messageText);
        // Also handle URLs pre-linked by objection.lol (Discord CDN, etc.)
        if (settings.inlineImages) processExistingAnchorLinks(li);

        li.classList.add('ep-chat-msg');
        li.classList.add('ep-msg-entering');
        setTimeout(() => li.classList.remove('ep-msg-entering'), 400);

        // Frame popup: direct images, Twitter/X media, and Tenor GIF pages.
        void resolveAndShowFramePopup(li, username, rawText);

        // Message context injection (pose/bubble info from WebSocket)
        if (username) {
            const contextParts = getMessageContext(li, messageText, username);
            if (contextParts.length) {
                const meta = document.createElement('span');
                meta.className = 'ep-msg-context';
                meta.textContent = contextParts.join(' | ');
                li.prepend(meta);
            }
        }

        // Action buttons
        const actions = document.createElement('span');
        actions.className = 'ep-msg-actions';
        actions.innerHTML = `
            <button class="ep-msg-btn ep-reply-btn" title="Reply to this message">↩</button>
            <button class="ep-msg-btn ep-copy-btn" title="Copy message">⧉</button>
            <button class="ep-msg-btn ep-block-btn" title="Block user" data-user="${escapeHTML(username)}">🚫</button>
        `;
        li.style.position = 'relative';
        li.appendChild(actions);

        actions.querySelector('.ep-copy-btn').addEventListener('click', () => {
            navigator.clipboard.writeText(rawText).then(() => showToast('Copied!'));
        });
        actions.querySelector('.ep-block-btn').addEventListener('click', () => {
            if (!username) return;
            const cur = settings.blockedUsers
                ? settings.blockedUsers.split(',').map(s => s.trim()).filter(Boolean) : [];
            if (!cur.includes(username)) cur.push(username);
            settings.blockedUsers = cur.join(', ');
            saveSettings();
            li.classList.add('ep-blocked');
            if (!li.querySelector('.ep-blocked-badge')) {
                const badge = document.createElement('span');
                badge.className = 'ep-blocked-badge';
                badge.innerHTML = `⛔ <strong>${escapeHTML(username)}</strong> blocked — <u>undo</u>`;
                badge.addEventListener('click', () => {
                    const list = settings.blockedUsers
                        ? settings.blockedUsers.split(',').map(s => s.trim()).filter(Boolean) : [];
                    settings.blockedUsers = list.filter(u => u !== username).join(', ');
                    saveSettings();
                    li.classList.remove('ep-blocked');
                    badge.remove();
                    showToast(`Unblocked "${username}"`);
                });
                li.prepend(badge);
            }
            showToast(`Blocked "${username}" — click badge to undo`);
        });
        actions.querySelector('.ep-reply-btn').addEventListener('click', () => {
            if (!username) return;
            // Use the entry's already-assigned id (captured via closure after log)
            pendingReplyTo = { id: entry ? entry.id : msgCount, user: username, text: messageText.slice(0, 120) };
            showReplyBar(username, messageText);
        });

        // Log it
        msgCount++;
        const entry = { id: msgCount, ts: new Date().toISOString(), user: username, text: messageText.trim() };
        // Threading: attach pending reply to the very next message (whoever sends it)
        if (pendingReplyTo) {
            entry.replyTo = { ...pendingReplyTo };
            pendingReplyTo = null;
            hideReplyBar();
        }
        chatLog.push(entry);
        // Inject reply quote bubble if this message has a replyTo
        if (entry.replyTo) {
            const q = document.createElement('span');
            q.className = 'ep-reply-quote';
            q.innerHTML = `↩ <strong>${escapeHTML(entry.replyTo.user)}</strong>: ${escapeHTML(entry.replyTo.text.slice(0, 80))}${entry.replyTo.text.length > 80 ? '…' : ''}`;
            li.prepend(q);
        }
        updateStatusBar();

        if (!matchesChatFilter(username, messageText)) li.classList.add('ep-filtered-out');

        if (hasHighlight(messageText)) {
            if (settings.playSoundOnHighlight) notificationSound.play();
            showHighlightToast(username, messageText);
        }


        // Sound effect triggers
        const sysAction = getSystemActionType(li);
        if (sysAction === 'join') {
            playSFX(settings.sfxJoinUrl, 'join');
        } else if (sysAction === 'leave') {
            playSFX(settings.sfxLeaveUrl, 'leave');
        } else if (sysAction === 'pair') {
            playSFX(settings.sfxPairUrl, 'pair');
        } else {
            const cmdType = getCommandSfxType(messageText, rawText);
            if (cmdType === '8ball') playSFX(settings.sfx8ballUrl, '8ball');
            else if (cmdType === 'roll') playSFX(settings.sfxRollUrl, 'roll');
            else if (cmdType === 'dice') playSFX(settings.sfxRollUrl, 'dice');
        }

        // TTS
        speakTTS(username, messageText);

        // Auto-scroll
        if (autoScrollEnabled) scrollToBottom();
    }

    function getMessageContext(li, rawText, username) {
        const parts = [];
        const text = rawText || '';
        const cached = findRecentMessageContext(username, text);
        if (cached?.pose) parts.push(cached.poseId ? `Pose ${cached.pose} (#${cached.poseId})` : `Pose ${cached.pose}`);
        else if (cached?.poseId) parts.push(`Pose #${cached.poseId}`);
        if (cached?.bubble) parts.push(`Bubble ${cached.bubble}`);
        const poseMatch = text.match(/\bpose(?:\s*id)?\s*[:#-]?\s*(\d+)\b/i)
            || li.innerHTML.match(/pose(?:Id|ID|_id)?["'=:\s-]+(\d+)/i);
        if (poseMatch && !parts.some(p => p.startsWith('Pose'))) parts.push(`Pose ${poseMatch[1]}`);
        const bubbleMatch = text.match(/\bbubble\s*[:#-]?\s*([a-z0-9_-]+)\b/i)
            || li.innerHTML.match(/bubble(?:Type|Id|ID)?["'=:\s-]+([a-z0-9_-]+)/i);
        if (bubbleMatch && !parts.some(p => p.startsWith('Bubble'))) parts.push(`Bubble ${bubbleMatch[1]}`);
        return parts;
    }

    function processTextNodes(li, username, rawText) {
        // Walk text nodes and replace URLs
        const walker = document.createTreeWalker(li, NodeFilter.SHOW_TEXT, {
            acceptNode: node => {
                const parent = node.parentElement;
                if (parent.tagName === 'A' || parent.tagName === 'MARK' || parent.tagName === 'SCRIPT' || parent.tagName === 'STYLE') return NodeFilter.FILTER_REJECT;
                if (parent.closest('strong, b, [class*="username"], [class*="Username"]')) return NodeFilter.FILTER_REJECT;
                if (parent.classList?.contains('ep-msg-actions')) return NodeFilter.FILTER_REJECT;
                return NodeFilter.FILTER_ACCEPT;
            }
        });

        const nodes = [];
        let node;
        while ((node = walker.nextNode())) nodes.push(node);

        const embeddedUrls = new Set(); // per-message URL dedup to prevent triple-embedding
        for (const textNode of nodes) {
            const text = textNode.nodeValue;
            if (!URL_REGEX.test(text) && !hasHighlight(text)) continue;

            URL_REGEX.lastIndex = 0;
            const frag = buildRichFragment(text, username, embeddedUrls);
            if (frag) textNode.parentNode.replaceChild(frag, textNode);
        }
    }

    function hasHighlight(text) {
        if (!settings.highlightWords) return false;
        const words = settings.highlightWords.split(',').map(w => w.trim()).filter(Boolean);
        if (!words.length) return false;
        return words.some(w => {
            try {
                // Use word-boundary lookahead/lookbehind so "mp" does not match "camping"
                const escaped = w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const re = new RegExp('(?<![\\w])' + escaped + '(?![\\w])', 'i');
                return re.test(text);
            } catch (e) {
                return text.toLowerCase().includes(w.toLowerCase());
            }
        });
    }

    // Embeds media for URLs already turned into <a> tags by objection.lol's renderer.
    // This fixes Discord CDN links (and others) that arrive pre-linkified.
    function processExistingAnchorLinks(li) {
        li.querySelectorAll('a[href]:not([data-ep-inline-done])').forEach(function(a) {
            var href = a.href || '';
            if (!href) return;
            a.setAttribute('data-ep-inline-done', '1');
            a.classList.add('ep-link');
            if (!a.dataset.epHover) attachHoverEvents(a);
            var cleanUrl = href.split('?')[0];
            var isDisc = DISCORD_CDN_RE.test(href);
            var isChan = FOURCHAN_MEDIA_RE.test(href);
            var isB4k  = B4K_RE.test(href);
            var isMedia = isDisc || isChan || isB4k || CATBOX_IMG_RE.test(href) ||
                IMGUR_RE.test(href) || IMAGE_EXT.test(cleanUrl);
            // Skip if inline media already exists within 4 siblings (buildRichFragment may
            // insert an <a> between the native anchor and its img wrapper div)
            var nx = a.nextElementSibling;
            var alreadyEmbedded = false;
            for (var _gi = 0; _gi < 4 && nx && !alreadyEmbedded; _gi++, nx = nx.nextElementSibling) {
                if ((nx.querySelector && nx.querySelector('img,video')) || nx.tagName === 'IMG' || nx.tagName === 'VIDEO') {
                    alreadyEmbedded = true;
                }
            }
            if (alreadyEmbedded) return;
            if (!isMedia) return;
            if (/\.(mp4|webm)$/i.test(cleanUrl)) {
                var vid = document.createElement('video');
                vid.controls = true; vid.preload = 'metadata';
                vid.style.cssText = 'display:block;max-width:320px;max-height:240px;margin-top:4px;border-radius:6px;border:1px solid #222;background:#000;';
                var vw = document.createElement('div'); vw.appendChild(vid);
                a.insertAdjacentElement('afterend', vw);
                loadVideoViaBlobOrDirect(vid, href, false);
            } else {
                var img = document.createElement('img');
                img.className = 'ep-inline-img'; img.alt = 'Image'; img.loading = 'lazy';
                if (isDisc || isChan || isB4k) loadImageViaBlob(img, href); else img.src = href;
                img.addEventListener('load', function() {
                    if (autoScrollEnabled) scrollToBottom();
                }, { once: true });
                img.addEventListener('click', function() {
                    var lg = document.createElement('img');
                    lg.style.cssText = 'max-width:72vw;max-height:78vh;border-radius:8px;box-shadow:0 8px 32px rgba(0,0,0,0.6);';
                    if (isDisc || isChan || isB4k) loadImageViaBlob(lg, href); else lg.src = href;
                    showHoverContent(lg);
                });
                var iw = document.createElement('div'); iw.appendChild(img);
                a.insertAdjacentElement('afterend', iw);
            }
        });
    }

    function buildRichFragment(text, username, embeddedUrls = null) {
        const frag = document.createDocumentFragment();
        let lastIdx = 0;
        const myName = '';

        const highlightWords = (settings.highlightWords || '').split(',').map(w => w.trim()).filter(Boolean);

        URL_REGEX.lastIndex = 0;
        let m;
        while ((m = URL_REGEX.exec(text)) !== null) {
            const before = text.slice(lastIdx, m.index);
            if (before) frag.appendChild(applyWordHighlights(before, highlightWords, myName));

            const url = m[0];
            let href = url.startsWith('http') ? url : 'https://' + url;
            try { href = new URL(href).href; } catch (_) {
                try { href = new URL(encodeURI(decodeURI(href))).href; } catch (_2) {}
            }
            const a = document.createElement('a');
            a.href = href; a.target = '_blank'; a.rel = 'noopener noreferrer';
            a.className = 'ep-link'; a.textContent = url;
            attachHoverEvents(a);
            frag.appendChild(a);

            if (settings.inlineImages) {
                const ytMatch = href.match(YOUTUBE_RE);
                const twMatch = href.match(TWITTER_RE);
                const twProfileMatch = href.match(TWITTER_PROFILE_RE);
                const redditMatch = href.match(REDDIT_RE);
                const tenorMatch = href.match(TENOR_RE);
                const klipyMatch = href.match(KLIPY_RE);
                const chanMatch = href.match(CHAN_RE);
                const ttMatch = href.match(TIKTOK_RE);
                const spotifyMatch = href.match(SPOTIFY_RE);
                const gdocMatch = href.match(GDOC_RE);
                const githubMatch = href.match(GITHUB_RE);
                const steamMatch = href.match(STEAM_RE);
                if (ytMatch) {
                    const iframe = document.createElement('iframe');
                    iframe.src = `https://www.youtube.com/embed/${ytMatch[1]}`;
                    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
                    iframe.allowFullscreen = true;
                    iframe.loading = 'lazy';
                    iframe.className = 'ep-inline-youtube';
                    frag.appendChild(iframe);
                } else if (twMatch) {
                    frag.appendChild(buildInlineTweet(twMatch[1], href, username));
                } else if (twProfileMatch && !FXTWITTER_CDN_RE.test(href) && !['home', 'explore', 'notifications', 'messages', 'search', 'i'].includes(twProfileMatch[1].toLowerCase())) {
                    frag.appendChild(buildInlineTwitterProfile(twProfileMatch[1], href));
                } else if (redditMatch) {
                    frag.appendChild(buildInlineReddit(href));
                } else if (tenorMatch && settings.tenorHoverPopup) {
                    frag.appendChild(buildInlineTenor(href, username));
                } else if (klipyMatch && settings.klipyHoverPopup) {
                    frag.appendChild(buildInlineKlipy(href, username));
                } else if (chanMatch && settings.fourchanHoverPopup) {
                    frag.appendChild(buildInline4chan(chanMatch[1], chanMatch[2], chanMatch[3], href));
                } else if (ttMatch) {
                    const ttWrap = document.createElement('div');
                    ttWrap.className = 'ep-inline-tweet';
                    const iframe = document.createElement('iframe');
                    iframe.src = `https://www.tiktok.com/embed/v2/${ttMatch[1]}`;
                    iframe.allow = 'autoplay; encrypted-media; picture-in-picture';
                    iframe.allowFullscreen = true;
                    iframe.loading = 'lazy';
                    iframe.style.cssText = 'border:none;border-radius:12px;width:340px;height:580px;max-width:100%;display:block;margin-top:6px;';
                    ttWrap.appendChild(iframe);
                    frag.appendChild(ttWrap);
                } else if (spotifyMatch && settings.spotifyHoverPopup) {
                    frag.appendChild(buildInlineSpotify(spotifyMatch[1], spotifyMatch[2], href));
                } else if (gdocMatch && settings.googleDocHoverPopup) {
                    frag.appendChild(buildInlineGoogleDoc(gdocMatch[1], gdocMatch[2], href));
                } else if (githubMatch && settings.githubHoverPopup) {
                    frag.appendChild(buildInlineGitHub(githubMatch[1], githubMatch[2], githubMatch[3], href));
                } else if (steamMatch && settings.steamHoverPopup) {
                    frag.appendChild(buildInlineSteam(steamMatch[1], href));
                }
            }

            // Inline image — deduplicated per message via embeddedUrls Set
            if (settings.inlineImages && (FOURCHAN_MEDIA_RE.test(href) || DISCORD_CDN_RE.test(href) || B4K_RE.test(href) || CATBOX_IMG_RE.test(url) || SEVENTV_RE.test(url) || IMGUR_RE.test(url) || IMAGE_EXT.test(url.split('?')[0]))) {
                const urlKey = href.toLowerCase().split('?')[0];
                if (!embeddedUrls || !embeddedUrls.has(urlKey)) {
                    if (embeddedUrls) embeddedUrls.add(urlKey);
                    // Mark anchor so processExistingAnchorLinks won't create a duplicate embed
                    a.setAttribute('data-ep-inline-done', '1');
                    const img = document.createElement('img');
                    img.className = 'ep-inline-img';
                    if (FOURCHAN_MEDIA_RE.test(href) || DISCORD_CDN_RE.test(href) || B4K_RE.test(href)) {
                        loadImageViaBlob(img, href);
                    } else {
                        img.src = href;
                    }
                    img.alt = 'Image'; img.loading = 'lazy';
                    img.addEventListener('load', () => { if (autoScrollEnabled) scrollToBottom(); }, { once: true });
                    img.addEventListener('click', () => {
                        const content = document.createElement('img');
                        content.style.cssText = 'max-width:72vw;max-height:78vh;border-radius:8px;box-shadow:0 8px 32px rgba(0,0,0,0.6);';
                        if (FOURCHAN_MEDIA_RE.test(href) || DISCORD_CDN_RE.test(href) || B4K_RE.test(href)) {
                            loadImageViaBlob(content, href);
                        } else {
                            content.src = href;
                        }
                        showHoverContent(content);
                    });
                    // put inline img in a block wrapper after the link
                    const br = document.createElement('div');
                    br.appendChild(img);
                    frag.appendChild(br);
                }
            }

            // Inline video for direct video links (4cdn .webm, catbox .mp4, etc.)
            // Excludes URLs already handled by the embed system above (Twitter/Tenor/etc.)
            if (settings.inlineImages && (VIDEO_EXT.test(url.split('?')[0]) || (DISCORD_CDN_RE.test(href) && /\.(mp4|webm)/i.test(href))) &&
                !TWITTER_RE.test(url) && !TENOR_RE.test(url) && !YOUTUBE_RE.test(url) && !KLIPY_RE.test(url)) {
                const urlKey = href.toLowerCase().split('?')[0];
                if (!embeddedUrls || !embeddedUrls.has(urlKey)) {
                    if (embeddedUrls) embeddedUrls.add(urlKey);
                    a.setAttribute('data-ep-inline-done', '1');
                    const vid = document.createElement('video');
                    vid.controls = true; vid.preload = 'metadata';
                    vid.style.cssText = 'display:block;max-width:320px;max-height:240px;margin-top:4px;border-radius:6px;border:1px solid #222;background:#000;cursor:pointer;';
                    const vWrap = document.createElement('div');
                    vWrap.appendChild(vid);
                    frag.appendChild(vWrap);
                    // Use blob fallback so media-src CSP cannot block .webm/.mp4 direct links
                    loadVideoViaBlobOrDirect(vid, href, false);
                }
            }

            lastIdx = m.index + m[0].length;
        }

        const tail = text.slice(lastIdx);
        if (tail) frag.appendChild(applyWordHighlights(tail, highlightWords, myName));

        return frag;
    }

    function buildInlineTweet(statusId, href, frameUser) {
        const wrap = document.createElement('div');
        wrap.className = 'ep-inline-tweet';
        wrap.innerHTML = '<div class="ep-tweet-card">Loading tweet...</div>';
        if (!gmRequest) {
            wrap.innerHTML = '<div class="ep-tweet-card">Tweet preview unavailable in this userscript manager.</div>';
            return wrap;
        }
        gmRequest({
            method: 'GET',
            url: `https://api.fxtwitter.com/status/${statusId}`,
            responseType: 'json',
            onload: r => {
                const data = r.response?.tweet;
                if (!data) {
                    wrap.innerHTML = `<div class="ep-tweet-card"><a class="ep-link" href="${escapeHTML(href)}" target="_blank" rel="noopener noreferrer">Open tweet</a></div>`;
                    return;
                }
                const media = getTweetMediaItems(data);
                // Build elements programmatically so gif autoplay and video playback work
                // reliably (innerHTML-inserted <video autoplay> does not fire in all browsers).
                const card = document.createElement('div');
                card.className = 'ep-tweet-card';
                const userEl = document.createElement('div');
                userEl.className = 'ep-tweet-user';
                userEl.textContent = '@' + (data.author?.screen_name || 'twitter');
                card.appendChild(userEl);
                const textEl = document.createElement('div');
                textEl.className = 'ep-tweet-text';
                textEl.textContent = data.text || '';
                card.appendChild(textEl);
                const gifVideos = [];
                if (media.length > 0) {
                    const mediaDiv = document.createElement('div');
                    mediaDiv.className = 'ep-tweet-media';
                    media.forEach(m => {
                        if (m.type === 'photo' && m.url) {
                            const img = document.createElement('img');
                            img.src = m.url; img.loading = 'lazy'; img.alt = 'Tweet image';
                            img.addEventListener('load', () => maybeFramePopupFromEmbed(frameUser, m.url, false), { once: true });
                            mediaDiv.appendChild(img);
                        } else if ((m.type === 'video' || m.type === 'gif' || m.type === 'animated_gif') &&
                                   (m.url || m.thumbnail_url || m.poster || m.variants || m.video_variants)) {
                            const videoUrl = pickTwitterVideoUrl(m);
                            if (!videoUrl) {
                                const a = document.createElement('a');
                                a.href = href; a.target = '_blank'; a.rel = 'noopener noreferrer';
                                a.className = 'ep-link'; a.textContent = 'Open Twitter media';
                                mediaDiv.appendChild(a);
                                return;
                            }
                            const vid = document.createElement('video');
                            const poster = m.thumbnail_url || m.poster || '';
                            if (poster) vid.poster = poster;
                            vid.controls = true;
                            vid.playsInline = true;
                            const isGif = m.type === 'gif' || m.type === 'animated_gif';
                            if (isGif) {
                                vid.autoplay = true;
                                vid.loop = true;
                                vid.muted = true;
                                vid.preload = 'auto';
                            } else {
                                vid.preload = 'metadata';
                            }
                            mediaDiv.appendChild(vid);
                            if (isGif) gifVideos.push(vid);
                            // Use blob fallback so media-src CSP can't block playback
                            loadVideoViaBlobOrDirect(vid, videoUrl, isGif);
                            maybeFramePopupFromEmbed(frameUser, videoUrl, isGif || /\.mp4/i.test(videoUrl));
                        }
                    });
                    if (mediaDiv.children.length > 0) card.appendChild(mediaDiv);
                }
                wrap.innerHTML = '';
                wrap.appendChild(card);
                // play() MUST be called after the element is in the document,
                // otherwise browsers may reject it as a detached-element play attempt.
                gifVideos.forEach(v => v.play().catch(() => {}));
            },
            onerror: () => {
                wrap.innerHTML = `<div class="ep-tweet-card"><a class="ep-link" href="${escapeHTML(href)}" target="_blank" rel="noopener noreferrer">Open tweet</a></div>`;
            }
        });
        return wrap;
    }

    // Attempt to set vid.src directly; on network/CSP error, re-fetch via gmRequest
    // and serve the video as a same-origin blob URL (bypasses media-src CSP).
    //
    // Special case — video.twimg.com URLs:
    // objection.lol's media-src CSP blocks video.twimg.com, and CSP violations on
    // <video> elements do NOT reliably fire the 'error' event, so the normal
    // error-triggered blob fallback below would never run, leaving a blank box.
    // For those URLs we skip the direct-src attempt entirely and go straight to
    // gmRequest → blob so CSP is bypassed from the start.
    function loadImageViaBlob(img, url) {
        if (!gmRequest) { img.src = url; return; }
        const extMap = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', webp: 'image/webp', bmp: 'image/bmp' };
        const ext = (url.split('?')[0].split('.').pop() || '').toLowerCase();
        const mime = extMap[ext] || 'image/jpeg';
        gmRequest({
            method: 'GET', url,
            responseType: 'arraybuffer',
            onload: r => {
                if (!r.response) { img.src = url; return; }
                try {
                    const blob = new Blob([r.response], { type: mime });
                    img.src = URL.createObjectURL(blob);
                } catch (e) { img.src = url; }
            },
            onerror: () => { img.src = url; }
        });
    }

    function loadVideoViaBlobOrDirect(vid, url, isGif) {
        if (!url) return;
        const mime = /\.webm(?:\?|$)/i.test(url) ? 'video/webm' : 'video/mp4';
        const isTwimgUrl = /video\.twimg\.com/i.test(url);
        if (isTwimgUrl && gmRequest) {
            gmRequest({
                method: 'GET', url,
                responseType: 'arraybuffer',
                onload: r => {
                    if (!r.response) {
                        vid.src = url;
                        if (isGif) vid.play().catch(() => {});
                        return;
                    }
                    try {
                        const blob = new Blob([r.response], { type: mime });
                        vid.src = URL.createObjectURL(blob);
                        vid.load();
                        if (isGif) vid.play().catch(() => {});
                    } catch (e) {
                        vid.src = url;
                        if (isGif) vid.play().catch(() => {});
                    }
                },
                onerror: () => {
                    vid.src = url;
                    if (isGif) vid.play().catch(() => {});
                }
            });
            return;
        }
        vid.src = url;
        if (isGif) vid.play().catch(() => {});
        vid.addEventListener('error', function onVidError() {
            if (!gmRequest) return;
            gmRequest({
                method: 'GET', url,
                responseType: 'arraybuffer',
                onload: r => {
                    if (!r.response) return;
                    try {
                        const blob = new Blob([r.response], { type: mime });
                        vid.src = URL.createObjectURL(blob);
                        vid.load();
                        if (isGif) vid.play().catch(() => {});
                    } catch (e) {}
                }
            });
        }, { once: true });
    }

    function pickTwitterVideoUrl(media) {
        // fxtwitter always puts the best direct URL in media.url — prefer it.
        if (media.url && /^https?:\/\//i.test(media.url)) return media.url;
        // Fallback: scan variants array sorted by bitrate.
        const variants = [].concat(media.variants || [], media.video_variants || []);
        const mp4Variants = variants.filter(v =>
            /mp4/i.test(v.content_type || '') || /\.mp4(?:\?|$)/i.test(v.url || ''));
        mp4Variants.sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));
        if (mp4Variants.length) return mp4Variants[0].url || '';
        // Last resort: deep-scan the object for any http URL.
        const candidates = collectMediaUrls(media);
        return candidates.find(u => /\.mp4(?:\?|$)/i.test(u)) || candidates[0] || '';
    }

    function getTweetMediaItems(data) {
        const media = data.media || {};
        // media.all already contains photos, videos, and gifs — prefer it exclusively
        // to avoid duplicating items that fxtwitter also surfaces in media.photos/videos/gifs.
        if (media.all && media.all.length > 0) return media.all.filter(Boolean);
        // Fallback when media.all is absent: merge individual arrays, deduping by URL
        const seen = new Set();
        return [
            ...(media.photos || []),
            ...(media.videos || []),
            ...(media.gifs || []),
            ...(data.photos || []),
            ...(data.videos || []),
        ].filter(Boolean).filter(m => {
            const key = m.url || m.thumbnail_url || JSON.stringify(m);
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    }

    function collectMediaUrls(value, out = []) {
        if (!value) return out;
        if (typeof value === 'string') {
            if (/^https?:\/\//i.test(value)) out.push(value);
            return out;
        }
        if (Array.isArray(value)) {
            value.forEach(item => collectMediaUrls(item, out));
            return out;
        }
        if (typeof value === 'object') {
            Object.entries(value).forEach(([key, item]) => {
                if (/^(url|src|source|mp4|video_url|playback_url)$/i.test(key)) collectMediaUrls(item, out);
                else if (/variant|video|media|gif/i.test(key)) collectMediaUrls(item, out);
            });
        }
        return [...new Set(out)];
    }

    // Fetch a Tenor GIF page and extract the animated media URL from og:video.
    // Uses browser-like headers to avoid being blocked by Cloudflare.
    // Falls back to oEmbed thumbnail (static JPEG) if the page fetch yields nothing.
    function buildInlineTenor(href, frameUser) {
        const wrap = document.createElement('div');
        wrap.className = 'ep-inline-tweet';
        wrap.innerHTML = '<div class="ep-tweet-card" style="color:#888;">Loading GIF…</div>';
        if (!gmRequest) {
            wrap.innerHTML = `<div class="ep-tweet-card"><a class="ep-link" href="${escapeHTML(href)}" target="_blank" rel="noopener noreferrer">Open GIF on Tenor</a></div>`;
            return wrap;
        }

        function renderTenorMedia(mp4Url, fallbackImgUrl, title) {
            const card = document.createElement('div');
            card.className = 'ep-tweet-card';
            card.style.padding = '6px';
            const mediaStyle = 'max-width:100%;max-height:220px;object-fit:contain;border-radius:5px;background:#050505;display:block;';
            if (mp4Url) {
                const vid = document.createElement('video');
                vid.autoplay = true; vid.loop = true; vid.muted = true;
                vid.playsInline = true; vid.style.cssText = mediaStyle;
                // If direct play is blocked by CSP, fetch as blob
                vid.addEventListener('error', () => {
                    if (fallbackImgUrl) {
                        const img = document.createElement('img');
                        img.src = fallbackImgUrl; img.loading = 'lazy'; img.style.cssText = mediaStyle;
                        img.addEventListener('load', () => { if (autoScrollEnabled) scrollToBottom(); }, { once: true });
                        vid.replaceWith(img);
                    }
                }, { once: true });
                vid.addEventListener('loadeddata', () => { if (autoScrollEnabled) scrollToBottom(); }, { once: true });
                vid.src = mp4Url;
                card.appendChild(vid);
                if (title) { const t = document.createElement('di' + 'v'); t.style.cssText = 'margin-top:4px;color:#888;font-size:11px;'; t.textContent = title; card.appendChild(t); }
                wrap.innerHTML = ''; wrap.appendChild(card);
                vid.play().catch(() => {});
                maybeFramePopupFromEmbed(frameUser, mp4Url, true);
            } else if (fallbackImgUrl) {
                const img = document.createElement('img');
                img.src = fallbackImgUrl; img.loading = 'lazy'; img.style.cssText = mediaStyle;
                img.addEventListener('load', () => {
                    if (autoScrollEnabled) scrollToBottom();
                    maybeFramePopupFromEmbed(frameUser, fallbackImgUrl, false);
                }, { once: true });
                card.appendChild(img);
                if (title) { const t = document.createElement('div'); t.style.cssText = 'margin-top:4px;color:#888;font-size:11px;'; t.textContent = title; card.appendChild(t); }
                wrap.innerHTML = ''; wrap.appendChild(card);
            } else {
                wrap.innerHTML = `<div class="ep-tweet-card"><a class="ep-link" href="${escapeHTML(href)}" target="_blank" rel="noopener noreferrer">Open GIF on Tenor</a></div>`;
            }
        }

        // Strategy 1: fetch the Tenor page HTML for og:video (gives the actual mp4 URL).
        gmRequest({
            method: 'GET',
            url: href,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Sec-Fetch-Mode': 'navigate'
            },
            onload: r => {
                const html = r.responseText || '';
                // Try og:video or og:video:url in either attribute order
                const ogVideoM =
                    html.match(/<meta[^>]+property=["']og:video(?::(?:secure_)?url)?["'][^>]+content=["']([^"']+)["']/i) ||
                    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:video(?::(?:secure_)?url)?["']/i) ||
                    html.match(/["']contentUrl["']\s*:\s*["']([^"']+\.mp4[^"']*)/i);
                const ogTitleM =
                    html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i) ||
                    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i);
                const ogImageM =
                    html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
                    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);

                const mp4Url = ogVideoM?.[1] || null;
                const title = ogTitleM?.[1]?.replace(/&amp;/g,'&').replace(/&#39;/g,"'").replace(/&quot;/g,'"') || '';
                const fallbackImg = ogImageM?.[1] || null;

                if (mp4Url) {
                    renderTenorMedia(mp4Url, fallbackImg, title);
                } else {
                    // Strategy 2: oEmbed fallback — get thumbnail_url hash to derive mp4 path
                    gmRequest({
                        method: 'GET',
                        url: `https://tenor.com/oembed?url=${encodeURIComponent(href)}&format=json`,
                        responseType: 'json',
                        onload: r2 => {
                            const thumb = r2.response?.thumbnail_url;
                            const ttl = r2.response?.title || title;
                            // Try to derive mp4 URL from media.tenor.com hash
                            const hashM = thumb?.match(/media\.tenor\.com\/([^/?#]+)\//);
                            const slugM = href.match(/tenor\.com\/view\/([\w-]+)/);
                            const derivedMp4 = (hashM && slugM)
                                ? `https://media.tenor.com/${hashM[1]}/${(thumb?.match(/\/([^\/?.]+)\.[\w]+(?:[?#]|$)/) || [,''])[1] || slugM?.[1] || ''}.mp4`
                                : null;
                            renderTenorMedia(derivedMp4, thumb, ttl);
                        },
                        onerror: () => {
                            wrap.innerHTML = `<div class="ep-tweet-card"><a class="ep-link" href="${escapeHTML(href)}" target="_blank" rel="noopener noreferrer">Open GIF on Tenor</a></div>`;
                        }
                    });
                }
            },
            onerror: () => {
                // Fall back straight to oEmbed if page fetch fails
                gmRequest({
                    method: 'GET',
                    url: `https://tenor.com/oembed?url=${encodeURIComponent(href)}&format=json`,
                    responseType: 'json',
                    onload: r2 => {
                        const thumb = r2.response?.thumbnail_url;
                        const ttl = r2.response?.title || '';
                        const hashM = thumb?.match(/media\.tenor\.com\/([^/?#]+)\//);
                        const slugM = href.match(/tenor\.com\/view\/([\w-]+)/);
                        const derivedMp4 = (hashM && slugM)
                            ? `https://media.tenor.com/${hashM[1]}/${(thumb?.match(/\/([^\/?.]+)\.[\w]+(?:[?#]|$)/) || [,''])[1] || slugM?.[1] || ''}.mp4`
                            : null;
                        renderTenorMedia(derivedMp4, thumb, ttl);
                    },
                    onerror: () => {
                        wrap.innerHTML = `<div class="ep-tweet-card"><a class="ep-link" href="${escapeHTML(href)}" target="_blank" rel="noopener noreferrer">Open GIF on Tenor</a></div>`;
                    }
                });
            }
        });
        return wrap;
    }

    function buildInlineKlipy(href, frameUser) {
        const wrap = document.createElement('div');
        wrap.className = 'ep-inline-tweet';
        wrap.innerHTML = '<div class="ep-tweet-card" style="color:#888;">Loading GIF\u2026</div>';
        if (!gmRequest) {
            wrap.innerHTML = `<div class="ep-tweet-card"><a class="ep-link" href="${escapeHTML(href)}" target="_blank" rel="noopener noreferrer">Open GIF on Klipy</a></div>`;
            return wrap;
        }

        function renderKlipyMedia(mp4Url, fallbackImgUrl, title) {
            const card = document.createElement('div');
            card.className = 'ep-tweet-card';
            card.style.padding = '6px';
            const mediaStyle = 'max-width:100%;max-height:220px;object-fit:contain;border-radius:5px;background:#050505;display:block;';
            if (mp4Url) {
                const vid = document.createElement('video');
                vid.autoplay = true; vid.loop = true; vid.muted = true;
                vid.playsInline = true; vid.style.cssText = mediaStyle;
                vid.addEventListener('error', () => {
                    if (fallbackImgUrl) {
                        const img = document.createElement('img');
                        img.src = fallbackImgUrl; img.loading = 'lazy'; img.style.cssText = mediaStyle;
                        img.addEventListener('load', () => { if (autoScrollEnabled) scrollToBottom(); }, { once: true });
                        vid.replaceWith(img);
                    }
                }, { once: true });
                vid.addEventListener('loadeddata', () => { if (autoScrollEnabled) scrollToBottom(); }, { once: true });
                vid.src = mp4Url;
                card.appendChild(vid);
                if (title) { const t = document.createElement('div'); t.style.cssText = 'margin-top:4px;color:#888;font-size:11px;'; t.textContent = title; card.appendChild(t); }
                wrap.innerHTML = ''; wrap.appendChild(card);
                vid.play().catch(() => {});
                maybeFramePopupFromEmbed(frameUser, mp4Url, true);
            } else if (fallbackImgUrl) {
                const img = document.createElement('img');
                img.src = fallbackImgUrl; img.loading = 'lazy'; img.style.cssText = mediaStyle;
                img.addEventListener('load', () => {
                    if (autoScrollEnabled) scrollToBottom();
                    maybeFramePopupFromEmbed(frameUser, fallbackImgUrl, false);
                }, { once: true });
                card.appendChild(img);
                if (title) { const t = document.createElement('div'); t.style.cssText = 'margin-top:4px;color:#888;font-size:11px;'; t.textContent = title; card.appendChild(t); }
                wrap.innerHTML = ''; wrap.appendChild(card);
            } else {
                showKlipyFallback();
            }
        }

        function showKlipyFallback() {
            wrap.innerHTML = `<div class="ep-tweet-card"><a class="ep-link" href="${escapeHTML(href)}" target="_blank" rel="noopener noreferrer">Open GIF on Klipy</a></div>`;
        }

        const klipySlug = href.match(/klipy\.com\/gifs\/([\w-]+)/i)?.[1];
        const klipyApiKey = getKlipyKey();
        let resolved = false;

        function tryKlipyApi() {
            if (!klipyApiKey) return;
            // Turn the page slug into a search query: strip a trailing "-<n>" index
            // and de-hyphenate ("bing-chi-ling-alex-mei-bing-1" → "bing chi ling alex mei bing")
            const q = klipySlug.replace(/-\d+$/, '').replace(/-/g, ' ');
            gmRequest({
                method: 'GET',
                url: `https://api.klipy.com/api/v1/${klipyApiKey}/gifs/search?q=${encodeURIComponent(q)}&page=1&per_page=24&customer_id=beop`,
                headers: { 'Accept': 'application/json' },
                responseType: 'json',
                onload: r => {
                    if (resolved) return;
                    const items = r.response?.data?.data;
                    if (!Array.isArray(items) || !items.length) return;
                    // Only accept an exact slug match; a wrong search hit is
                    // worse than falling through to the HTML page scrape.
                    const match = klipyFindBySlug(items, klipySlug);
                    if (!match) return;
                    const mp4  = klipyFileUrl(match, ['mp4'], ['hd', 'md', 'sm']);
                    const anim = klipyFileUrl(match, ['gif', 'webp'], ['hd', 'md', 'sm']);
                    if (mp4 || anim) {
                        resolved = true;
                        renderKlipyMedia(mp4, anim, match.title || '');
                    }
                },
                onerror: () => {}
            });
        }

        function tryKlipyHtmlFallback() {
            // Fetch the Klipy page — GM_xmlhttpRequest sends cf_clearance + session cookies
            // so this succeeds for users who recently visited klipy.com.
            // Parse static.klipy.com CDN URLs from the Next.js RSC payload.
            gmRequest({
                method: 'GET',
                url: href,
                headers: {
                    'Accept': 'text/html,application/xhtml+xml',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Cache-Control': 'no-cache',
                    'Referer': 'https://klipy.com/'
                },
                onload: r => {
                    if (resolved) return;
                    const html = r.responseText || '';
                    // Bail early if Cloudflare challenge page returned
                    if (html.includes('challenges.cloudflare.com') || html.includes('_cf_chl_opt')) return;

                    // 1. og:video tags (most reliable)
                    const ogM =
                        html.match(/<meta[^>]+property=["']og:video(?::(?:secure_)?url)?["'][^>]+content=["']([^"']+)["']/i) ||
                        html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:video(?::(?:secure_)?url)?["']/i);

                    // 2. JSON-LD VideoObject
                    const jldM = html.match(/"contentUrl"\s*:\s*"(https?:\/\/[^"]+\.(?:mp4|webm|gif)[^"]*)"/i);

                    // 3. static.klipy.com CDN URLs in the RSC payload (any video format)
                    const cdnVideoM = html.match(/https:\\?\/\\?\/static\.klipy\.com\\?\/[^\s"'\\]+\.mp4/i)
                        || html.match(/https:\\?\/\\?\/static\.klipy\.com\\?\/[^\s"'\\]+\.webm/i)
                        || html.match(/https:\\?\/\\?\/static\.klipy\.com\\?\/[^\s"'\\]+\.gif/i);

                    // 4. static.klipy.com CDN image URLs (webp/jpg fallback)
                    const cdnImgM = html.match(/https:\\?\/\\?\/static\.klipy\.com\\?\/[^\s"'\\]+\.webp/i)
                        || html.match(/https:\\?\/\\?\/static\.klipy\.com\\?\/[^\s"'\\]+\.(?:jpg|png)/i);

                    // Clean escaped slashes from RSC JSON strings
                    function cleanUrl(s) { return s ? s.replace(/\\+\//g, '/') : null; }

                    const mp4 = cleanUrl(ogM?.[1] || jldM?.[1] || cdnVideoM?.[0]);
                    const img = cleanUrl(cdnImgM?.[0]);

                    if (mp4 || img) {
                        resolved = true;
                        renderKlipyMedia(mp4, img, '');
                    }
                },
                onerror: () => {}
            });
        }

        if (klipySlug) {
            // Race: try API and HTML page in parallel; first success wins
            tryKlipyApi();
            // Give the API 1.5s head-start, then fall back to HTML page scrape
            setTimeout(() => { if (!resolved) tryKlipyHtmlFallback(); }, 1500);
            // Final fallback: show button after 8s if neither resolved
            setTimeout(() => { if (!resolved) { resolved = true; showKlipyFallback(); } }, 8000);
        } else {
            showKlipyFallback();
        }
        return wrap;
    }

    function buildInline4chan(board, thread, postId, href) {
        const wrap = document.createElement('div');
        wrap.className = 'ep-reddit-card';
        wrap.style.cssText = 'border-left:3px solid #789922;';
        wrap.innerHTML = '<div style="color:#888;font-size:12px;">Loading post…</div>';
        if (!gmRequest) {
            wrap.innerHTML = `<div class="ep-reddit-title">4chan /${board}/</div><a class="ep-link" href="${escapeHTML(href)}" target="_blank" rel="noopener noreferrer">Open link</a>`;
            return wrap;
        }
        gmRequest({
            method: 'GET',
            url: `https://a.4cdn.org/${board}/thread/${thread}.json`,
            responseType: 'json',
            onload: r => {
                const posts = r.response?.posts;
                if (!posts?.length) {
                    wrap.innerHTML = `<div class="ep-reddit-title">4chan /${board}/</div><a class="ep-link" href="${escapeHTML(href)}" target="_blank" rel="noopener noreferrer">Open link</a>`;
                    return;
                }
                const post = postId ? (posts.find(p => String(p.no) === postId) || posts[0]) : posts[0];
                const isOP = post === posts[0];
                const name = post.name || 'Anonymous';
                const comment = (post.com || '').replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').trim();
                const isVideo4cdn = post.tim && post.ext && /\.(webm|mp4|mov)$/i.test(post.ext);
                const isGif4cdn = post.tim && post.ext && /\.gif$/i.test(post.ext);
                let imgHtml = '';
                if (post.tim && post.ext) {
                    const fullUrl = `https://i.4cdn.org/${board}/${post.tim}${post.ext}`;
                    const thumbUrl = `https://i.4cdn.org/${board}/${post.tim}s.jpg`;
                    if (isVideo4cdn) {
                        imgHtml = `<video src="${fullUrl}" controls preload="metadata" loop
                            style="display:block;max-width:100%;max-height:200px;object-fit:contain;border-radius:5px;margin-bottom:6px;background:#050505;"></video>`;
                    } else {
                        imgHtml = `<a href="${fullUrl}" target="_blank" rel="noopener noreferrer">
                            <img src="${thumbUrl}" loading="lazy" alt="Post image"
                                style="float:left;max-width:80px;max-height:80px;object-fit:cover;border-radius:4px;margin:0 8px 4px 0;background:#050505;cursor:pointer;"></a>`;
                    }
                }
                wrap.innerHTML = `
                    <div style="font-size:11px;color:#555;margin-bottom:4px;">/${board}/ thread #${thread}${postId ? ` › No.${postId}` : ''}</div>
                    ${post.sub ? `<div style="color:#af0a0f;font-weight:700;margin-bottom:4px;">${escapeHTML(post.sub)}</div>` : ''}
                    ${imgHtml}
                    <span style="color:#789922;font-weight:700;">${escapeHTML(name)}</span>
                    <span style="color:#555;font-size:10px;margin-left:4px;">No.${post.no}</span>
                    <div style="margin-top:4px;color:#ccc;font-size:12px;clear:both;white-space:pre-wrap;">${escapeHTML(comment).slice(0, 500)}${comment.length > 500 ? '…' : ''}</div>
                    <div style="margin-top:6px;"><a class="ep-link" href="${escapeHTML(href)}" target="_blank" rel="noopener noreferrer">Open on 4chan</a></div>`;
            },
            onerror: () => {
                wrap.innerHTML = `<div class="ep-reddit-title">4chan /${board}/</div><a class="ep-link" href="${escapeHTML(href)}" target="_blank" rel="noopener noreferrer">Open link</a>`;
            }
        });
        return wrap;
    }

    function buildInlineTwitterProfile(username, href) {
        const wrap = document.createElement('div');
        wrap.className = 'ep-inline-tweet';
        wrap.innerHTML = `
            <div class="ep-tweet-card">
                <div class="ep-tweet-user">@${escapeHTML(username)}</div>
                <div class="ep-tweet-text">Twitter/X profile</div>
                <a class="ep-link" href="${escapeHTML(href)}" target="_blank" rel="noopener noreferrer">Open profile</a>
            </div>`;
        return wrap;
    }

    function buildInlineReddit(href) {
        const wrap = document.createElement('div');
        wrap.className = 'ep-reddit-card';
        wrap.innerHTML = '<div class="ep-reddit-title">Loading Reddit...</div>';
        if (!gmRequest) {
            wrap.innerHTML = `<div class="ep-reddit-title">Reddit</div><a class="ep-link" href="${escapeHTML(href)}" target="_blank" rel="noopener noreferrer">Open link</a>`;
            return wrap;
        }
        const api = href.replace(/^https?:\/\/(?:www\.)?reddit\.com/, 'https://www.reddit.com').replace(/\/?([?#].*)?$/, '.json');
        gmRequest({
            method: 'GET',
            url: api,
            headers: { 'User-Agent': 'beop-enhancer/0.826 (greasyfork.org/scripts/578034)' },
            responseType: 'json',
            onload: r => {
                const post = Array.isArray(r.response) ? r.response[0]?.data?.children?.[0]?.data : r.response?.data?.children?.[0]?.data;
                if (!post) {
                    wrap.innerHTML = `<div class="ep-reddit-title">Reddit</div><a class="ep-link" href="${escapeHTML(href)}" target="_blank" rel="noopener noreferrer">Open link</a>`;
                    return;
                }
                const title = post.title || 'Reddit post';
                const author = post.author ? `u/${post.author}` : 'Reddit';
                const thumb = post.preview?.images?.[0]?.source?.url?.replace(/&amp;/g, '&');
                wrap.innerHTML = `
                    <div class="ep-reddit-title">${escapeHTML(title)}</div>
                    <div style="color:#888;margin-bottom:6px;">${escapeHTML(author)} · r/${escapeHTML(post.subreddit || '')}</div>
                    ${thumb ? `<img src="${escapeHTML(thumb)}" loading="lazy" alt="Reddit preview" style="max-width:100%;max-height:180px;border-radius:5px;background:#050505;object-fit:contain;">` : ''}
                    <div style="margin-top:6px;"><a class="ep-link" href="${escapeHTML(href)}" target="_blank" rel="noopener noreferrer">Open Reddit</a></div>`;
            },
            onerror: () => {
                wrap.innerHTML = `<div class="ep-reddit-title">Reddit</div><a class="ep-link" href="${escapeHTML(href)}" target="_blank" rel="noopener noreferrer">Open link</a>`;
            }
        });
        return wrap;
    }

    function buildInlineSpotify(type, id, href) {
        const wrap = document.createElement('div');
        wrap.style.cssText = 'margin-top:6px;width:min(360px,100%);';
        const heightMap = { track: 152, episode: 152, album: 352, playlist: 352, artist: 352, show: 352 };
        const h = heightMap[type.toLowerCase()] || 152;
        const iframe = document.createElement('iframe');
        iframe.src = `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`;
        iframe.width = '100%';
        iframe.height = String(h);
        iframe.allow = 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
        iframe.loading = 'lazy';
        iframe.style.cssText = `border:none;border-radius:12px;display:block;`;
        wrap.appendChild(iframe);
        // MP3 download shortcuts for tracks and episodes
        if (type.toLowerCase() === 'track' || type.toLowerCase() === 'episode') {
            const dlRow = document.createElement('div');
            dlRow.style.cssText = 'margin-top:5px;display:flex;gap:5px;flex-wrap:wrap;align-items:center;';
            const label = document.createElement('span');
            label.style.cssText = 'font-size:10px;color:#555;letter-spacing:0.04em;text-transform:uppercase;font-weight:700;margin-right:2px;';
            label.textContent = 'DL MP3:';
            dlRow.appendChild(label);
            const converters = [
                { name: 'SpotiSaver', url: 'https://spotisaver.net/?url=' + encodeURIComponent(href) },
                { name: 'spotdl.xyz', url: 'https://spotdl.xyz/?url=' + encodeURIComponent(href) },
                { name: 'tomp3.cc',   url: 'https://tomp3.cc/spotify-to-mp3/?url=' + encodeURIComponent(href) },
            ];
            converters.forEach(function(c) {
                const a = document.createElement('a');
                a.href = c.url;
                a.target = '_blank';
                a.rel = 'noopener noreferrer';
                a.textContent = c.name;
                a.style.cssText = 'font-size:11px;color:#1db954;background:rgba(29,185,84,0.1);border:1px solid rgba(29,185,84,0.28);padding:2px 8px;border-radius:5px;text-decoration:none;white-space:nowrap;';
                a.addEventListener('mouseover', function() { a.style.background = 'rgba(29,185,84,0.22)'; });
                a.addEventListener('mouseout',  function() { a.style.background = 'rgba(29,185,84,0.1)'; });
                dlRow.appendChild(a);
            });
            wrap.appendChild(dlRow);
        }
        return wrap;
    }

    function buildInlineGoogleDoc(type, id, href) {
        const wrap = document.createElement('div');
        wrap.style.cssText = 'margin-top:6px;width:min(360px,100%);';
        const typeMap = { document: 'document', spreadsheets: 'spreadsheets', presentation: 'presentation' };
        const t = typeMap[type.toLowerCase()] || 'document';
        const embedUrl = `https://docs.google.com/${t}/d/${id}/preview`;
        const iframe = document.createElement('iframe');
        iframe.src = embedUrl;
        iframe.width = '100%';
        iframe.height = '280';
        iframe.loading = 'lazy';
        iframe.style.cssText = 'border:1px solid rgba(255,255,255,0.08);border-radius:8px;background:#0a0a0c;display:block;';
        const fallback = document.createElement('div');
        fallback.style.cssText = 'margin-top:4px;font-size:11px;color:#666;';
        const labelMap = { document: 'Google Doc', spreadsheets: 'Google Sheet', presentation: 'Google Slides' };
        fallback.textContent = labelMap[type.toLowerCase()] || 'Google Doc';
        wrap.appendChild(iframe);
        wrap.appendChild(fallback);
        return wrap;
    }

    function buildInlineGitHub(owner, repo, issueNum, href) {
        const wrap = document.createElement('div');
        wrap.className = 'ep-reddit-card';
        wrap.style.cssText = 'border-left:3px solid #6e7681;';
        wrap.innerHTML = '<div style="color:#888;font-size:12px;">Loading GitHub…</div>';
        if (!gmRequest) {
            wrap.innerHTML = `<div style="color:#58a6ff;font-weight:700;">${escapeHTML(owner)}/${escapeHTML(repo)}</div><a class="ep-link" href="${escapeHTML(href)}" target="_blank" rel="noopener noreferrer">Open on GitHub</a>`;
            return wrap;
        }
        const apiUrl = issueNum
            ? `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/issues/${issueNum}`
            : `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
        gmRequest({
            method: 'GET',
            url: apiUrl,
            headers: { 'Accept': 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' },
            responseType: 'json',
            onload: r => {
                const d = r.response;
                if (!d) {
                    wrap.innerHTML = `<div style="color:#58a6ff;font-weight:700;">${escapeHTML(owner)}/${escapeHTML(repo)}</div><a class="ep-link" href="${escapeHTML(href)}" target="_blank" rel="noopener noreferrer">Open on GitHub</a>`;
                    return;
                }
                if (issueNum) {
                    const stateColor = d.state === 'open' ? '#3fb950' : '#f85149';
                    const stateLabel = d.state === 'open' ? 'Open' : 'Closed';
                    wrap.innerHTML = `
                        <div style="font-size:10px;color:#8b949e;margin-bottom:4px;">${escapeHTML(owner)}/${escapeHTML(repo)}</div>
                        <div style="color:#c9d1d9;font-weight:700;margin-bottom:4px;">${escapeHTML(d.title || '')}</div>
                        <div style="margin-bottom:6px;">
                            <span style="display:inline-flex;align-items:center;gap:4px;font-size:10px;padding:2px 8px;border-radius:999px;border:1px solid ${stateColor};color:${stateColor};">
                                ${stateLabel}
                            </span>
                            <span style="font-size:10px;color:#8b949e;margin-left:6px;">#${d.number} by ${escapeHTML(d.user?.login || '')}</span>
                        </div>
                        ${d.body ? `<div style="font-size:12px;color:#8b949e;white-space:pre-wrap;">${escapeHTML((d.body || '').slice(0, 300))}${(d.body || '').length > 300 ? '…' : ''}</div>` : ''}
                        <div style="margin-top:6px;"><a class="ep-link" href="${escapeHTML(href)}" target="_blank" rel="noopener noreferrer">Open on GitHub</a></div>`;
                } else {
                    const stars = d.stargazers_count != null ? `★ ${Number(d.stargazers_count).toLocaleString()}` : '';
                    const forks = d.forks_count != null ? `⑂ ${Number(d.forks_count).toLocaleString()}` : '';
                    const lang = d.language ? `· ${escapeHTML(d.language)}` : '';
                    wrap.innerHTML = `
                        <div style="color:#58a6ff;font-weight:700;margin-bottom:4px;">${escapeHTML(owner)}/${escapeHTML(repo)}</div>
                        ${d.description ? `<div style="font-size:12px;color:#8b949e;margin-bottom:6px;">${escapeHTML(d.description)}</div>` : ''}
                        <div style="font-size:11px;color:#666;">${stars}${forks ? '  ' + forks : ''}${lang ? '  ' + lang : ''}</div>
                        <div style="margin-top:6px;"><a class="ep-link" href="${escapeHTML(href)}" target="_blank" rel="noopener noreferrer">Open on GitHub</a></div>`;
                }
            },
            onerror: () => {
                wrap.innerHTML = `<div style="color:#58a6ff;font-weight:700;">${escapeHTML(owner)}/${escapeHTML(repo)}</div><a class="ep-link" href="${escapeHTML(href)}" target="_blank" rel="noopener noreferrer">Open on GitHub</a>`;
            }
        });
        return wrap;
    }

    function buildInlineSteam(appId, href) {
        const wrap = document.createElement('div');
        wrap.style.cssText = 'margin-top:6px;width:min(360px,100%);';
        const iframe = document.createElement('iframe');
        iframe.src = `https://store.steampowered.com/widget/${appId}/`;
        iframe.width = '100%';
        iframe.height = '190';
        iframe.loading = 'lazy';
        iframe.style.cssText = 'border:none;border-radius:8px;display:block;background:#1b2838;';
        iframe.title = 'Steam Store';
        wrap.appendChild(iframe);
        return wrap;
    }


    function applyWordHighlights(text, words, myName) {
        const frag = document.createDocumentFragment();
        if (!words.length && !myName) {
            frag.appendChild(document.createTextNode(text));
            return frag;
        }

        // Combine patterns
        const patterns = [...words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), myName && myName].filter(Boolean);
        if (!patterns.length) { frag.appendChild(document.createTextNode(text)); return frag; }

        // Wrap each pattern with word-boundary lookaround so partial-word matches are skipped
        const boundedPatterns = patterns.map(p => '(?<![\\w])' + p + '(?![\\w])');
        const regex = new RegExp(`(${boundedPatterns.join('|')})`, 'gi');
        let last = 0, match;
        while ((match = regex.exec(text)) !== null) {
            if (match.index > last) frag.appendChild(document.createTextNode(text.slice(last, match.index)));
            const mark = document.createElement('mark');
            const isMention = myName && match[0].toLowerCase() === myName;
            mark.className = isMention ? 'ep-mention' : 'ep-highlight';
            mark.textContent = match[0];
            frag.appendChild(mark);
            last = match.index + match[0].length;
        }
        if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
        return frag;
    }

    function normalizeMsgText(text) {
        return String(text || '').replace(/\s+/g, ' ').trim().toLowerCase().slice(0, 160);
    }

    function findDeepValue(obj, keys) {
        const seen = new Set();
        const stack = [obj];
        while (stack.length) {
            const cur = stack.pop();
            if (!cur || typeof cur !== 'object' || seen.has(cur)) continue;
            seen.add(cur);
            for (const [key, value] of Object.entries(cur)) {
                if (keys.some(k => key.toLowerCase() === k.toLowerCase()) && value !== undefined && value !== null && value !== '') {
                    return value;
                }
                if (value && typeof value === 'object') stack.push(value);
            }
        }
        return '';
    }

    function rememberMessageContext(payload) {
        if (!payload || typeof payload !== 'object') return;
        const text = findDeepValue(payload, [
            'text', 'message', 'msg', 'content', 'dialogue', 'testimony',
            'speech', 'line', 'chatMessage', 'chatText', 'body', 'chat', 'txt', 'data'
        ]);
        const user = findDeepValue(payload, [
            'username', 'user', 'name', 'author', 'sender', 'from',
            'nick', 'handle', 'player', 'displayName', 'display_name'
        ]);
        const pose = findDeepValue(payload, ['poseName', 'pose_name', 'pose']);
        const poseId = findDeepValue(payload, ['poseId', 'poseID', 'pose_id', 'poseIndex']);
        const bubble = findDeepValue(payload, ['bubbleName', 'bubble_name', 'bubble', 'bubbleType', 'bubbleId']);
        // Track which side of the courtroom each user is on
        const rawSide = findDeepValue(payload, ['side', 'seat', 'charSide', 'char_side', 'character_side', 'team', 'role', 'type']);
        if (user && rawSide !== undefined && rawSide !== '') {
            const sl = String(rawSide).toLowerCase();
            const ukey = String(user).trim().toLowerCase();
            if (sl.includes('def') || sl === 'left' || sl === '0' || sl === 'a')
                userSides[ukey] = 'left';
            else if (sl.includes('pro') || sl === 'right' || sl === '1' || sl === 'b')
                userSides[ukey] = 'right';
        }
        if (!text && !pose && !poseId && !bubble) return;
        recentMessageContexts.push({
            at: Date.now(),
            text: normalizeMsgText(text),
            user: String(user || '').trim().toLowerCase(),
            userRaw: String(user || '').trim(),   // original case for display
            pose: String(pose || '').trim(),
            poseId: String(poseId || '').trim(),
            bubble: String(bubble || '').trim(),
        });
        while (recentMessageContexts.length > 80) recentMessageContexts.shift();
    }

    function scanSocketPayloadForContexts(payload) {
        if (!Array.isArray(payload)) return;
        const items = payload.slice(1);

        // Handle structured object payloads (fields by name)
        items.forEach(item => {
            if (item && typeof item === 'object') {
                rememberMessageContext(item);
                if (Array.isArray(item)) item.forEach(sub => {
                    if (sub && typeof sub === 'object') rememberMessageContext(sub);
                });
            }
        });

        // Handle positional payloads: ["eventName", username, messageText]
        // Socket.IO sometimes sends args as bare strings, not named fields.
        const strings = items.filter(x => typeof x === 'string' && x.trim().length > 0);
        if (strings.length >= 2) {
            // Try every adjacent pair as (user, text) in case of multiple args
            for (let i = 0; i < strings.length - 1; i++) {
                rememberMessageContext({ username: strings[i], text: strings.slice(i + 1).join(' ') });
            }
        }
        // Also try treating the whole flat string array as objects the usual way
        items.forEach(item => {
            if (typeof item === 'string') {
                // Store as bare text with no user; helps text-matching later
                recentMessageContexts.push({
                    at: Date.now(), text: normalizeMsgText(item),
                    user: '', userRaw: '', pose: '', poseId: '', bubble: ''
                });
            }
        });
        while (recentMessageContexts.length > 80) recentMessageContexts.shift();
    }

    function findRecentMessageContext(username, text) {
        const now = Date.now();
        const user = String(username || '').trim().toLowerCase();
        const norm = normalizeMsgText(text);
        for (let i = recentMessageContexts.length - 1; i >= 0; i--) {
            const ctx = recentMessageContexts[i];
            if (now - ctx.at > 120000) continue;
            const userOk = !ctx.user || !user || ctx.user === user;
            const textOk = !ctx.text || !norm || norm.includes(ctx.text) || ctx.text.includes(norm);
            if (userOk && textOk) return ctx;
        }
        return null;
    }

    // ─── Frame popup helpers ─────────────────────────────────────────────────────

    // Immediately fade out and remove all currently-visible frame popups.
    // Called whenever any new message arrives so the popup is only visible
    // while that message is the most recent one.
    function dismissAllFramePopups(fast) {
        const keys = Object.keys(activeFramePopups);
        if (!keys.length) return;
        keys.forEach(key => {
            const p = activeFramePopups[key];
            if (!p) return;
            delete activeFramePopups[key];
            p.style.transition = fast ? 'opacity 0.15s ease' : 'opacity 0.35s ease';
            p.style.opacity = '0';
            setTimeout(() => { try { p.remove(); } catch {} }, fast ? 200 : 400);
        });
    }

    // Returns the courtroom scene container (the left/main game area).
    function getSceneContainer() {
        if (isHorizontalLayout()) {
            const grid = document.querySelector(
                '#root > .MuiContainer-root > .MuiGrid2-root.MuiGrid2-container'
            );
            if (grid) {
                const first = grid.querySelector(':scope > .MuiGrid2-root');
                if (first) return first;
            }
        }
        // Drawer layout / fallback: use the root minus the chat drawer
        return document.getElementById('root') || document.body;
    }

    function collectMessageUrls(li, rawText) {
        const urls = new Set();
        li.querySelectorAll('a[href]').forEach(a => { if (a.href) urls.add(a.href); });
        URL_REGEX.lastIndex = 0;
        let m;
        while ((m = URL_REGEX.exec(rawText || '')) !== null) {
            const href = m[0].startsWith('http') ? m[0] : 'https://' + m[0];
            urls.add(href);
        }
        return [...urls];
    }

    function findDirectFrameImageUrl(li, rawText) {
        for (const a of li.querySelectorAll('a')) {
            const url = a.href || '';
            const clean = url.split('?')[0];
            if (FOURCHAN_MEDIA_RE.test(url) || CATBOX_IMG_RE.test(url) || SEVENTV_RE.test(url) || IMAGE_EXT.test(clean) ||
                /https?:\/\/i\.imgur\.com\/[^\s<>"']+\.(jpe?g|png|gif|webp)/i.test(url)) {
                return url;
            }
        }
        const inlineImg = li.querySelector('img.ep-inline-img, .ep-tweet-media img, .ep-inline-tweet img');
        if (inlineImg?.src) return inlineImg.src;

        URL_REGEX.lastIndex = 0;
        let m;
        while ((m = URL_REGEX.exec(rawText || '')) !== null) {
            const href = m[0].startsWith('http') ? m[0] : 'https://' + m[0];
            const clean = href.split('?')[0];
            if (FOURCHAN_MEDIA_RE.test(href) || CATBOX_IMG_RE.test(href) || SEVENTV_RE.test(href) || IMAGE_EXT.test(clean) ||
                /https?:\/\/i\.imgur\.com\/[^\s<>"']+\.(jpe?g|png|gif|webp)/i.test(href)) {
                return href;
            }
        }
        return null;
    }

    function fetchTwitterFrameMedia(href) {
        return new Promise(resolve => {
            const tw = href.match(TWITTER_RE);
            if (!tw || !gmRequest) return resolve(null);
            gmRequest({
                method: 'GET',
                url: `https://api.fxtwitter.com/status/${tw[1]}`,
                responseType: 'json',
                onload: r => {
                    const data = r.response?.tweet;
                    if (!data) return resolve(null);
                    const items = getTweetMediaItems(data);
                    if (!items.length) return resolve(null);
                    const media = items[0];
                    if (media.type === 'photo' && media.url) {
                        return resolve({ url: media.url, isVideo: false });
                    }
                    const videoUrl = pickTwitterVideoUrl(media);
                    if (videoUrl) return resolve({ url: videoUrl, isVideo: true });
                    if (media.thumbnail_url) return resolve({ url: media.thumbnail_url, isVideo: false });
                    resolve(null);
                },
                onerror: () => resolve(null),
            });
        });
    }

    function fetchTenorFrameMedia(href) {
        return new Promise(resolve => {
            if (!TENOR_RE.test(href) || !gmRequest) return resolve(null);

            const finish = (mp4Url, fallbackImg) => {
                if (mp4Url) resolve({ url: mp4Url, isVideo: true });
                else if (fallbackImg) resolve({ url: fallbackImg, isVideo: false });
                else resolve(null);
            };

            const oembedFallback = () => {
                gmRequest({
                    method: 'GET',
                    url: `https://tenor.com/oembed?url=${encodeURIComponent(href)}&format=json`,
                    responseType: 'json',
                    onload: r => {
                        const thumb = r.response?.thumbnail_url;
                        const hashM = thumb?.match(/media\.tenor\.com\/([^/?#]+)\//);
                        const slugM = href.match(/tenor\.com\/view\/([\w-]+)/);
                        const derivedMp4 = (hashM && slugM)
                            ? `https://media.tenor.com/${hashM[1]}/${(thumb?.match(/\/([^\/?.]+)\.[\w]+(?:[?#]|$)/) || [,''])[1] || slugM?.[1] || ''}.mp4`
                            : null;
                        finish(derivedMp4, thumb);
                    },
                    onerror: () => finish(null, null),
                });
            };

            gmRequest({
                method: 'GET',
                url: href,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                },
                onload: r => {
                    const html = r.responseText || '';
                    const ogVideoM =
                        html.match(/<meta[^>]+property=["']og:video(?::(?:secure_)?url)?["'][^>]+content=["']([^"']+)["']/i) ||
                        html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:video(?::(?:secure_)?url)?["']/i);
                    const ogImageM =
                        html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
                        html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
                    if (ogVideoM?.[1]) return finish(ogVideoM[1], ogImageM?.[1]);
                    oembedFallback();
                },
                onerror: oembedFallback,
            });
        });
    }

    function maybeFramePopupFromEmbed(username, mediaUrl, isVideo) {
        if (settings.imageFramePopup === false || !mediaUrl) return;
        showFramePopup(username || 'media', mediaUrl, { isVideo: !!isVideo });
    }

    async function resolveAndShowFramePopup(li, username, rawText) {
        if (settings.imageFramePopup === false) return;

        const direct = findDirectFrameImageUrl(li, rawText);
        if (direct) {
            const isVideo = /\.(mp4|webm)(\?|$)/i.test(direct) || /media\.tenor\.com\/.*\/mp4\//i.test(direct);
            showFramePopup(username, direct, { isVideo });
            return;
        }

        for (const href of collectMessageUrls(li, rawText)) {
            if (TWITTER_RE.test(href)) {
                const media = await fetchTwitterFrameMedia(href);
                if (media) {
                    showFramePopup(username, media.url, media);
                    return;
                }
            }
            if (TENOR_RE.test(href)) {
                const media = await fetchTenorFrameMedia(href);
                if (media) {
                    showFramePopup(username, media.url, media);
                    return;
                }
            }
        }
    }

    // ─── Parse total GIF loop duration from raw GIF bytes (sums all frame delays) ─
    function parseGifDuration(buffer) {
        const data = new Uint8Array(buffer);
        if (data.length < 13) return 0;
        let total = 0;
        // Skip header (6 bytes) + logical screen descriptor (7 bytes) + optional global color table
        const gctSize = (data[10] & 0x80) ? 3 * (1 << ((data[10] & 0x07) + 1)) : 0;
        let i = 13 + gctSize;
        while (i < data.length) {
            if (data[i] === 0x3B) break; // GIF trailer
            if (data[i] === 0x21) { // Extension introducer
                const label = data[i + 1];
                i += 2;
                if (label === 0xF9 && data[i] >= 4) { // Graphic Control Extension
                    // delay is at offsets +2 and +3 from block start (centiseconds, LE)
                    const delay = data[i + 2] | (data[i + 3] << 8);
                    total += Math.max(delay, 2); // browsers enforce ~20ms minimum per frame
                }
                // Skip all sub-blocks
                while (i < data.length && data[i] !== 0x00) i += data[i] + 1;
                i++; // block terminator
            } else if (data[i] === 0x2C) { // Image descriptor
                i += 9;
                if (i >= data.length) break;
                const lctSize = (data[i] & 0x80) ? 3 * (1 << ((data[i] & 0x07) + 1)) : 0;
                i += 1 + lctSize + 1; // flags + optional local color table + LZW min code size
                while (i < data.length && data[i] !== 0x00) i += data[i] + 1;
                i++; // block terminator
            } else {
                i++;
            }
        }
        return total / 100; // centiseconds → seconds
    }

    // Show a floating image popup over the courtroom scene, positioned on the
    // user's side (left = defense, right = prosecution).
    function showFramePopup(username, mediaUrl, opts = {}) {
        const imgUrl = mediaUrl || '';
        const isVideo = opts.isVideo ?? (
            /\.(mp4|webm)(\?|$)/i.test(imgUrl) || /media\.tenor\.com\/.*\/mp4\//i.test(imgUrl)
        );
        const filename = imgUrl.split('/').pop().split('?')[0].trim();
        const displayName = filename || imgUrl || '(media)';
        const key = displayName.toLowerCase();

        // Dismiss any existing popup for this user
        if (activeFramePopups[key]) {
            activeFramePopups[key].remove();
            delete activeFramePopups[key];
        }

        // Track appearance order for fallback side assignment
        if (!userOrder.includes(key)) userOrder.push(key);

        // Resolve side: WebSocket data first, then order-of-appearance
        let side = userSides[key];
        if (!side) side = userOrder.indexOf(key) % 2 === 0 ? 'left' : 'right';

        const popup = document.createElement('div');
        popup.className = 'ep-frame-popup';
        // Use direct assignment — cssText += is unreliable after setProperty
        popup.style.setProperty('--ep-frame-color', hashToUserColor(displayName));
        popup.style.position = 'fixed';
        popup.style.zIndex = '9994';

        const nameBar = document.createElement('div');
        nameBar.className = 'ep-frame-popup-name';
        const nameText = document.createElement('span');
        nameText.className = 'ep-frame-popup-name-text';
        nameText.textContent = displayName;
        const timerEl = document.createElement('span');
        timerEl.className = 'ep-frame-popup-timer';
        timerEl.textContent = '7s';
        nameBar.appendChild(nameText);
        nameBar.appendChild(timerEl);
        popup.appendChild(nameBar);

        let mediaEl;
        if (isVideo) {
            mediaEl = document.createElement('video');
            // Do NOT set src here -- video.twimg.com is blocked by objection.lol's
            // media-src CSP. loadVideoViaBlobOrDirect() fetches via gmRequest and
            // serves a same-origin blob URL instead (called below after appendChild).
            mediaEl.autoplay = true;
            mediaEl.loop = true;
            mediaEl.muted = true;
            mediaEl.playsInline = true;
            mediaEl.preload = 'auto';
        } else {
            mediaEl = document.createElement('img');
            mediaEl.alt = '';
            if (FOURCHAN_MEDIA_RE.test(imgUrl)) {
                loadImageViaBlob(mediaEl, imgUrl);
            } else {
                // Do NOT set crossOrigin — servers that omit CORS headers (e.g. fxtwitter
                // CDN, direct media hosts) will fail to load if crossOrigin='anonymous'
                // is set, even though the same URL displays fine without it.
                mediaEl.src = imgUrl;
            }
        }
        popup.appendChild(mediaEl);

        // Position + size: fill the character's half of the scene dynamically.
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const pad = 12; // gap between popup edge and scene edge

        const scene = getSceneContainer();
        const sr = scene ? scene.getBoundingClientRect() : null;
        const sceneOk = sr && sr.width > 100 && sr.height > 100;

        // --- Size ---
        // Horizontally: fill the character's half of the scene minus padding.
        // Vertically: stay inside the portrait area, which is roughly the top
        // 62% of the scene height (below that is the speech bubble + controls).
        const sizeScale = settings.framePopupSize === 'small' ? 0.65
                        : settings.framePopupSize === 'large'  ? 1.0
                        : 0.82; // medium default
        const halfW      = sceneOk ? sr.width  / 2 * sizeScale : vw / 2 * sizeScale;
        const portraitH  = sceneOk ? sr.height * 0.62          : vh * 0.38;
        const maxPopW    = Math.round(Math.max(160, halfW    - pad * 2));
        const maxPopH    = Math.round(Math.max(100, portraitH - pad * 2));

        popup.style.maxWidth = maxPopW + 'px';
        popup.style.width    = maxPopW + 'px';
        mediaEl.style.maxWidth   = maxPopW + 'px';
        mediaEl.style.maxHeight  = (maxPopH - 28) + 'px'; // 28 px for name bar
        mediaEl.style.objectFit = 'contain';
        mediaEl.style.display = 'block';

        // --- Horizontal: align with the scene edge matching the user's side ---
        // Left-side popup -> left edge flush with scene left.
        // Right-side popup -> right edge flush with scene right.
        let left;
        if (sceneOk) {
            left = side === 'right'
                ? Math.round(sr.right - maxPopW - pad)
                : Math.round(sr.left + pad);
        } else {
            left = side === 'right'
                ? Math.round(vw - maxPopW - pad)
                : pad;
        }

        // --- Vertical: bottom of popup anchored to the top of the text box ---
        // The text/speech box begins at sr.top + portraitH.
        const textboxTop = sceneOk ? sr.top + portraitH : vh * 0.62;
        let top = Math.round(textboxTop - maxPopH);

        // Clamp to viewport
        left = Math.max(pad, Math.min(vw - maxPopW - pad, left));
        top  = Math.max(pad, Math.min(vh - 60, top));

        popup.style.left = left + 'px';
        popup.style.top  = top  + 'px';

        // Refine vertical once we know the real rendered height
        const onMediaReady = () => {
            const ph = popup.offsetHeight || maxPopH;
            const refined = Math.round(textboxTop - ph);
            popup.style.top = Math.max(pad, Math.min(vh - ph - pad, refined)) + 'px';
        };
        mediaEl.addEventListener(isVideo ? 'loadeddata' : 'load', onMediaReady, { once: true });
        // For video: use blob fetch to bypass media-src CSP; also handles play().
        // For img: src was already set above.
        if (isVideo) loadVideoViaBlobOrDirect(mediaEl, imgUrl, true);

        document.body.appendChild(popup);
        activeFramePopups[key] = popup;

        // Popup auto-dismisses after a duration that scales with actual media length.
        let dismissStarted = false;
        function startDismissTimer(duration) {
            if (dismissStarted) return;
            dismissStarted = true;
            const secs = Math.round(Math.max(4, Math.min(60, duration)));
            timerEl.textContent = secs + 's';
            let cnt = secs;
            const iv = setInterval(() => {
                cnt--;
                if (cnt > 0) timerEl.textContent = cnt + 's';
                else clearInterval(iv);
            }, 1000);
            setTimeout(() => {
                if (activeFramePopups[key] !== popup) return;
                clearInterval(iv);
                popup.classList.add('ep-frame-out');
                setTimeout(() => {
                    popup.remove();
                    if (activeFramePopups[key] === popup) delete activeFramePopups[key];
                }, 580);
            }, secs * 1000);
        }

        const isGifUrl = /\.gif(\?|$)/i.test(imgUrl);
        if (isVideo) {
            // Use actual video duration once metadata is available
            timerEl.textContent = '…s';
            mediaEl.addEventListener('loadedmetadata', function onMeta() {
                const dur = isFinite(mediaEl.duration) && mediaEl.duration > 0 ? mediaEl.duration : 7;
                startDismissTimer(dur);
            }, { once: true });
            setTimeout(() => startDismissTimer(7), 5000); // fallback if metadata never arrives
        } else if (isGifUrl && typeof gmRequest !== 'undefined' && gmRequest) {
            // Fetch GIF bytes and parse actual loop duration from frame delays
            timerEl.textContent = '…s';
            gmRequest({
                method: 'GET', url: imgUrl, responseType: 'arraybuffer',
                onload: r => {
                    const dur = r.response ? parseGifDuration(r.response) : 0;
                    startDismissTimer(dur > 0.5 ? dur : 7);
                },
                onerror: () => startDismissTimer(7),
            });
            setTimeout(() => startDismissTimer(7), 6000); // fallback
        } else {
            startDismissTimer(7);
        }
    }

    // ─── Active frame text box — per-character bounce animation ─────────────────
    function initFrameTextAnimation() {
        const TEXT_PAT = /textbox|text-box|speech|dialogue|testimony|message-text|bubble-text|line-text|chattext|chat-text/i;
        let textBoxObs = null;
        let lastTextBox = null;

        function animateAddedNode(node) {
            if (node.nodeType === 1) {
                // Element (e.g. <span> per character injected by objection.lol)
                if (!node.classList.contains('ep-char-bounce')) {
                    node.classList.add('ep-char-bounce');
                }
            } else if (node.nodeType === 3) {
                // Raw text node — wrap it so we can animate it
                const val = node.nodeValue || '';
                if (!val.trim()) return;
                const span = document.createElement('span');
                span.className = 'ep-char-bounce';
                if (node.parentNode) {
                    node.parentNode.insertBefore(span, node);
                    span.appendChild(node);
                }
            }
        }

        function observeTextBox(el) {
            if (el === lastTextBox) return;
            if (textBoxObs) textBoxObs.disconnect();
            lastTextBox = el;
            textBoxObs = new MutationObserver(function(muts) {
                muts.forEach(function(mut) {
                    mut.addedNodes.forEach(animateAddedNode);
                });
            });
            textBoxObs.observe(el, { childList: true, subtree: true });
        }

        // Scan for the text box continuously as the DOM changes
        const domScanner = new MutationObserver(function() {
            const scene = getSceneContainer();
            if (!scene) return;
            const els = scene.querySelectorAll('[class],[id]');
            for (let i = 0; i < els.length; i++) {
                const el = els[i];
                if (!TEXT_PAT.test(el.className + ' ' + el.id)) continue;
                if (el.closest('ul, #ep-chat-list, .MuiInputBase-root, textarea, .ep-composer-textentry')) continue;
                observeTextBox(el);
                break;
            }
        });
        domScanner.observe(document.body, { childList: true, subtree: true });
    }

    // ─── Chat observer ───────────────────────────────────────────────────────────
    // chatList must be the <ul> element itself (from findChatList)
    function startChatObserver(chatList) {
        if (!chatList) return;
        if (chatObserver) { chatObserver.disconnect(); chatObserver = null; }

        chatListEl = chatList;
        chatListEl.id = 'ep-chat-list';

        // Process existing messages (backfill — TTS must be suppressed here)
        ttsReady = false;
        chatListEl.querySelectorAll(':scope > li').forEach(processNewMessage);
        ttsReady = true;

        // Create a scroll anchor
        if (!scrollAnchor) {
            scrollAnchor = document.createElement('div');
            scrollAnchor.id = 'ep-scroll-anchor';
            chatListEl.appendChild(scrollAnchor);
        }

        // Detect manual scroll — retry until the scroller is reliably found
        // (the container may still be empty/unsized when startChatObserver runs).
        function attachScrollListener() {
            const scroller = getOrFindScroller();
            if (!scroller) { setTimeout(attachScrollListener, 300); return; }
            scroller.addEventListener('scroll', () => {
                const atBottom = scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight < 80;
                if (!atBottom && autoScrollEnabled) {
                    autoScrollEnabled = false;
                    settings.autoScroll = false;
                    saveSettings();
                    updateScrollPausedIndicator();
                } else if (atBottom && !autoScrollEnabled) {
                    autoScrollEnabled = true;
                    settings.autoScroll = true;
                    updateScrollPausedIndicator();
                }
            }, { passive: true });
        }
        // Small delay so existing messages are rendered before we measure
        setTimeout(attachScrollListener, 200);

        chatObserver = new MutationObserver(muts => {
            for (const mut of muts) {
                for (const node of mut.addedNodes) {
                    if (node.nodeType === 1 && node.tagName === 'LI') {
                        processNewMessage(node);
                    }
                }
            }
        });
        chatObserver.observe(chatListEl, { childList: true });
    }



    // ─── GIF Picker ───────────────────────────────────────────────────────────────
    let gifPickerEl = null;
    let gifPickerOpen = false;
    let gifSearchTimer = null;
    let gifActiveTab = 'search';

    function getGiphyKey() {
        return (settings.giphyApiKey || '').trim();
    }

    function fetchGiphyGifs(query, cb) {
        if (!gmRequest) { cb([]); return; }
        const key = getGiphyKey();
        if (!key) { cb([]); return; }
        const url = query
            ? `https://api.giphy.com/v1/gifs/search?api_key=${key}&q=${encodeURIComponent(query)}&limit=20&rating=g`
            : `https://api.giphy.com/v1/gifs/trending?api_key=${key}&limit=20&rating=g`;
        gmRequest({
            method: 'GET', url,
            responseType: 'json',
            onload: r => cb(r.response?.data || []),
            onerror: () => cb([])
        });
    }

    function getKlipyKey() {
        return (settings.klipyApiKey || '').trim();
    }

    // Find the API item matching a klipy.com page slug.
    // API slugs carry a random suffix ("saber-fate-carnival-phantasm--kH4q5JEZa"),
    // so compare the base part (before "--") against the page slug.
    function klipyFindBySlug(items, pageSlug) {
        const slug = pageSlug.toLowerCase();
        const slugNoIdx = slug.replace(/-\d+$/, '');
        const baseOf = g => (g.slug || '').toString().toLowerCase().split('--')[0];
        return items.find(g => baseOf(g) === slug)
            || (slugNoIdx !== slug ? items.find(g => baseOf(g) === slugNoIdx) : null)
            || null;
    }

    // Pull a media URL out of a Klipy API item: item.file.{size}.{format}.url
    function klipyFileUrl(gif, formats, sizes) {
        const file = gif?.file || {};
        for (const size of sizes) {
            for (const fmt of formats) {
                const u = file?.[size]?.[fmt]?.url;
                if (u) return u;
            }
        }
        return null;
    }

    function fetchKlipyGifs(query, cb) {
        if (!gmRequest) { cb([]); return; }
        const key = getKlipyKey();
        if (!key) { cb([]); return; }
        const customer = encodeURIComponent(
            'beop-' + (localStorage.getItem(JOIN_USERNAME_KEY) || 'anon'));
        const url = query
            ? `https://api.klipy.com/api/v1/${key}/gifs/search?q=${encodeURIComponent(query)}&page=1&per_page=24&customer_id=${customer}`
            : `https://api.klipy.com/api/v1/${key}/gifs/trending?page=1&per_page=24&customer_id=${customer}`;
        gmRequest({
            method: 'GET', url,
            headers: { 'Accept': 'application/json' },
            responseType: 'json',
            onload: r => {
                const items = r.response?.data?.data;
                cb(Array.isArray(items) ? items : []);
            },
            onerror: () => cb([])
        });
    }

    function getGifFavourites() {
        return gmGet('gif_favourites', []);
    }
    function saveGifFavourites(favs) {
        gmSet('gif_favourites', favs);
    }
    function isGifFavourited(sendUrl) {
        return getGifFavourites().some(f => f.sendUrl === sendUrl);
    }
    function toggleGifFavourite(sendUrl, thumb, title) {
        let favs = getGifFavourites();
        const idx = favs.findIndex(f => f.sendUrl === sendUrl);
        if (idx >= 0) { favs.splice(idx, 1); } else { favs.unshift({ sendUrl, thumb, title }); }
        saveGifFavourites(favs);
        return idx < 0; // true = now favourited
    }
    function makeGifItem(thumb, sendUrl, title, inFavsTab) {
        const item = document.createElement('div');
        item.className = 'ep-gif-item';
        const img = document.createElement('img');
        img.src = thumb; img.loading = 'lazy'; img.alt = title || 'GIF';
        item.appendChild(img);
        item.title = img.alt;
        const favBtn = document.createElement('button');
        const faved = isGifFavourited(sendUrl);
        favBtn.className = 'ep-gif-fav-btn' + (faved ? ' saved' : '');
        favBtn.textContent = '★';
        favBtn.title = faved ? 'Remove from favourites' : 'Add to favourites';
        favBtn.addEventListener('click', e => {
            e.stopPropagation();
            const nowFaved = toggleGifFavourite(sendUrl, thumb, title);
            favBtn.classList.toggle('saved', nowFaved);
            favBtn.title = nowFaved ? 'Remove from favourites' : 'Add to favourites';
            if (!nowFaved && inFavsTab) {
                item.style.transition = 'opacity .2s';
                item.style.opacity = '0';
                setTimeout(() => item.remove(), 220);
            }
        });
        item.appendChild(favBtn);
        item.addEventListener('click', () => { closeGifPicker(); insertGifToChat(sendUrl); });
        return item;
    }
    function loadFavouritesView() {
        const grid = document.getElementById('ep-gif-grid');
        if (!grid) return;
        const favs = getGifFavourites();
        if (!favs.length) {
            grid.innerHTML = '<div class="ep-gif-empty">No favourites yet.<br>Star a GIF to save it here.</div>';
            return;
        }
        grid.innerHTML = '';
        favs.forEach(({ sendUrl, thumb, title }) => grid.appendChild(makeGifItem(thumb, sendUrl, title, true)));
    }

    function createGifPicker() {
        if (document.getElementById('ep-gif-picker')) {
            gifPickerEl = document.getElementById('ep-gif-picker');
            return;
        }
        gifPickerEl = document.createElement('div');
        gifPickerEl.id = 'ep-gif-picker';
        gifPickerEl.classList.add('hidden');
        gifPickerEl.innerHTML = `
            <div id="ep-gif-header">
                <input id="ep-gif-search" type="text" placeholder="Search GIFs…" autocomplete="off" spellcheck="false">
            </div>
            <div id="ep-gif-tabs">
                <button class="ep-gif-tab active" data-tab="search">Search</button>
                <button class="ep-gif-tab" data-tab="favs">★ Favourites</button>
            </div>
            <div id="ep-gif-grid"><div class="ep-gif-empty">Loading…</div></div>
        `;
        document.body.appendChild(gifPickerEl);

        gifPickerEl.querySelector('#ep-gif-search').addEventListener('input', e => {
            if (gifActiveTab !== 'search') return;
            clearTimeout(gifSearchTimer);
            const q = e.target.value.trim();
            gifSearchTimer = setTimeout(() => loadGifResults(q), 380);
        });

        gifPickerEl.querySelectorAll('.ep-gif-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                gifActiveTab = tab.dataset.tab;
                gifPickerEl.querySelectorAll('.ep-gif-tab').forEach(t => t.classList.toggle('active', t === tab));
                const searchEl = document.getElementById('ep-gif-search');
                if (gifActiveTab === 'favs') {
                    if (searchEl) searchEl.style.opacity = '0.35';
                    loadFavouritesView();
                } else {
                    if (searchEl) { searchEl.style.opacity = ''; searchEl.focus(); }
                    loadGifResults(searchEl?.value.trim() || '');
                }
            });
        });

        document.addEventListener('mousedown', e => {
            if (gifPickerOpen && gifPickerEl && !gifPickerEl.contains(e.target) && !e.target.closest('.ep-gif-btn')) {
                closeGifPicker();
            }
        }, true);
    }

    function loadGifResults(query) {
        const grid = document.getElementById('ep-gif-grid');
        if (!grid) return;
        grid.innerHTML = '<div class="ep-gif-empty">Loading…</div>';

        const src = (settings.gifPickerSource || 'giphy');

        function renderGifs(gifs, noKeyMsg) {
            if (!gifs.length) {
                grid.innerHTML = `<div class="ep-gif-empty">${noKeyMsg || (query ? 'No results.' : 'Could not load GIFs.')}</div>`;
                return;
            }
            grid.innerHTML = '';
            gifs.forEach(gif => {
                let thumb, sendUrl, title;
                if (src === 'klipy') {
                    thumb   = klipyFileUrl(gif, ['gif', 'webp'], ['sm', 'xs', 'md']);
                    sendUrl = klipyFileUrl(gif, ['gif'], ['hd', 'md', 'sm']) || thumb;
                    title   = gif.title || gif.slug || 'GIF';
                } else {
                    // Giphy response shape
                    thumb = gif.images?.fixed_height_small?.url || gif.images?.fixed_height?.url;
                    sendUrl = gif.images?.original?.url || gif.images?.fixed_height?.url || thumb;
                    title = gif.title || 'GIF';
                }
                if (!thumb || !sendUrl) return;
                grid.appendChild(makeGifItem(thumb, sendUrl, title, false));
            });
        }

        if (src === 'klipy') {
            fetchKlipyGifs(query, gifs => renderGifs(gifs, !getKlipyKey() ? 'Add your Klipy API key in Settings → Media → GIF Picker.' : null));
        } else {
            fetchGiphyGifs(query, gifs => renderGifs(gifs, !getGiphyKey() ? 'Add your Giphy API key in Settings → Media → GIF Picker.' : null));
        }
    }

    function positionGifPicker(btn) {
        const rect = btn.getBoundingClientRect();
        const W = 380, H = 500;
        let top = rect.top - H - 8;
        let left = rect.left;
        if (top < 8) top = rect.bottom + 8;
        if (left + W > window.innerWidth - 8) left = window.innerWidth - W - 8;
        if (left < 8) left = 8;
        gifPickerEl.style.top = top + 'px';
        gifPickerEl.style.left = left + 'px';
    }

    function openGifPicker(btn) {
        if (!gifPickerEl) createGifPicker();
        gifPickerOpen = true;
        gifPickerEl.classList.remove('hidden');
        document.querySelectorAll('.ep-gif-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        positionGifPicker(btn);
        // Always open on Search tab
        gifActiveTab = 'search';
        gifPickerEl.querySelectorAll('.ep-gif-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === 'search'));
        const inp = document.getElementById('ep-gif-search');
        if (inp) { inp.value = ''; inp.style.opacity = ''; inp.focus(); }
        loadGifResults('');
    }

    function closeGifPicker() {
        gifPickerOpen = false;
        if (gifPickerEl) gifPickerEl.classList.add('hidden');
        document.querySelectorAll('.ep-gif-btn').forEach(b => b.classList.remove('active'));
    }

    function insertGifToChat(url) {
        // Target the right-side OOC chat input specifically.
        const SEL_INPUT = 'input[type="text"].MuiInputBase-input, textarea.MuiInputBase-inputMultiline, input[type="text"].MuiFilledInput-input';
        let chatInput = null;
        if (isHorizontalLayout()) {
            const container = document.querySelector('#root > .MuiContainer-root > .MuiGrid2-root.MuiGrid2-container');
            if (container) {
                const cols = [...container.querySelectorAll(':scope > .MuiGrid2-root')];
                if (cols.length) chatInput = cols[cols.length - 1].querySelector(SEL_INPUT);
            }
        } else {
            const drawer = document.querySelector('body > div.MuiDrawer-root > div.MuiPaper-root');
            chatInput = drawer ? drawer.querySelector(SEL_INPUT) : null;
        }
        if (!chatInput) chatInput = document.querySelector(SEL_INPUT);
        if (!chatInput) { showToast('Chat input not found.'); return; }

        // Set value via React's internal setter so React state updates
        const proto = Object.getPrototypeOf(chatInput);
        const desc = Object.getOwnPropertyDescriptor(proto, 'value');
        if (desc && desc.set) desc.set.call(chatInput, url);
        else chatInput.value = url;
        chatInput.dispatchEvent(new Event('input', { bubbles: true }));
        chatInput.focus();

        // Find the send button: the visible, enabled button closest to
        // the right of the chat input at the same vertical position.
        function findSendButton() {
            const iRect = chatInput.getBoundingClientRect();
            const EP_CLASSES = ['ep-gif-btn', 'ep-native-tab', 'ep-top-btn', 'ep-btn'];
            const candidates = [...document.querySelectorAll('#root button, form button')].filter(b => {
                if (b.disabled) return false;
                if (EP_CLASSES.some(c => b.classList.contains(c))) return false;
                if (b.closest('#ep-gif-picker') || b.closest('#ep-panel') ||
                    b.closest('#ep-courtroom-bar') || b.closest('#ep-top-cover')) return false;
                const r = b.getBoundingClientRect();
                if (r.width === 0 || r.height === 0) return false;
                // Must be roughly at the same vertical level as the input
                const vOverlap = Math.max(0, Math.min(r.bottom, iRect.bottom) - Math.max(r.top, iRect.top));
                return vOverlap > 0 && r.left >= iRect.left - 8;
            });
            if (!candidates.length) return null;
            // Pick the one closest to the right edge of the input
            candidates.sort((a, b) => {
                const ar = a.getBoundingClientRect(), br = b.getBoundingClientRect();
                return ar.left - br.left;
            });
            return candidates[candidates.length - 1];
        }

        // Give React one tick to process the value, then submit
        setTimeout(() => {
            const sendBtn = findSendButton();
            if (sendBtn) { sendBtn.click(); return; }
            // Fallback: fire full Enter key sequence on the input
            ['keydown', 'keypress', 'keyup'].forEach(t =>
                chatInput.dispatchEvent(new KeyboardEvent(t, {
                    key: 'Enter', code: 'Enter', keyCode: 13, which: 13,
                    bubbles: true, cancelable: true
                }))
            );
        }, 50);
    }

    function initGifPickerBtn(root) {
        createGifPicker();
        const SEL = 'input[type="text"].MuiInputBase-input, textarea.MuiInputBase-inputMultiline, input[type="text"].MuiFilledInput-input';

        function attachBtn(inputEl) {
            if (inputEl.dataset.epGifAttached) return;
            // Never attach inside a dialog (native settings, etc.) or the enhancer panel.
            if (inputEl.closest('[role="dialog"]') ||
                inputEl.closest('.MuiDialog-root') ||
                inputEl.closest('#ep-panel')) return;
            // Never attach to spectator / other non-chat textboxes.
            if (inputEl.getAttribute('aria-label') === 'Spectator Username') return;
            // Only attach to the right-side OOC chat input.
            // In horizontal layout that is the rightmost MuiGrid2-root column;
            // in drawer layout it lives inside the MuiDrawer-root paper.
            let inOocPanel = false;
            // Helper: find the first input in `scope` that appears after the chat <ul> in DOM order.
            // This reliably identifies the OOC send box (below the message list) vs other inputs
            // (username, muted users, pose, etc.) that live above or outside the chat list.
            function findChatSendInput(scope) {
                const chatUl = scope.querySelector('ul');
                const allInputs = [...scope.querySelectorAll(SEL)];
                if (chatUl && allInputs.length) {
                    const afterList = allInputs.filter(inp =>
                        chatUl.compareDocumentPosition(inp) & Node.DOCUMENT_POSITION_FOLLOWING
                    );
                    return afterList[0] || null;
                }
                // No chat list yet — fall back to the last input in scope.
                return allInputs.length ? allInputs[allInputs.length - 1] : null;
            }
            if (isHorizontalLayout()) {
                const container = document.querySelector('#root > .MuiContainer-root > .MuiGrid2-root.MuiGrid2-container');
                if (container) {
                    const cols = [...container.querySelectorAll(':scope > .MuiGrid2-root')];
                    if (cols.length) {
                        const lastCol = cols[cols.length - 1];
                        inOocPanel = findChatSendInput(lastCol) === inputEl;
                    }
                }
            } else {
                const drawer = document.querySelector('body > div.MuiDrawer-root > div.MuiPaper-root');
                if (drawer) {
                    inOocPanel = findChatSendInput(drawer) === inputEl;
                }
            }
            if (!inOocPanel) return;
            inputEl.dataset.epGifAttached = '1';

            const parent = inputEl.closest('.MuiInputBase-root') || inputEl.parentElement;
            if (!parent) return;
            const wrapper = parent.parentElement;
            if (!wrapper) return;
            if (wrapper.querySelector('.ep-gif-btn')) return; // already have one

            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'ep-gif-btn';
            btn.textContent = 'GIF';
            btn.title = 'Search Giphy GIFs (Ctrl+G)';
            btn.addEventListener('click', e => {
                e.stopPropagation();
                if (gifPickerOpen) closeGifPicker();
                else openGifPicker(btn);
            });

            const wrapStyle = window.getComputedStyle(wrapper);
            if (wrapStyle.display !== 'flex' && wrapStyle.display !== 'inline-flex') {
                wrapper.style.display = 'flex';
                wrapper.style.alignItems = 'center';
                wrapper.style.gap = '4px';
            }
            wrapper.insertBefore(btn, parent.nextSibling);
        }

        root.querySelectorAll(SEL).forEach(attachBtn);
        new MutationObserver(muts => {
            for (const m of muts) for (const n of m.addedNodes) {
                if (n.nodeType !== 1) continue;
                if (n.matches?.(SEL)) attachBtn(n);
                n.querySelectorAll?.(SEL).forEach(attachBtn);
            }
        }).observe(root, { childList: true, subtree: true });
    }

    // ─── File upload via drag & drop ─────────────────────────────────────────────
    function initDragUpload(root) {
        if (!settings.catboxUpload) return;
        const SEL = `input[type="text"], input[type="url"], textarea`;

        let prevContent = '', prevSel = 0;

        function setVal(el, v) {
            const proto = Object.getPrototypeOf(el);
            const desc = Object.getOwnPropertyDescriptor(proto, 'value');
            desc?.set?.call(el, v);
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
        }

        function upload(data) {
            return new Promise((resolve, reject) => {
                const fd = new FormData();
                fd.append('reqtype', data instanceof File ? 'fileupload' : 'urlupload');
                fd.append(data instanceof File ? 'fileToUpload' : 'url', data);
                const provider = settings.uploadProvider || 'catbox';
                let uploadUrl = 'https://catbox.moe/user/api.php';
                if (provider === 'filegarden') {
                    if (!settings.filegardenUserId) {
                        reject(new Error('Add your File Garden user ID in Beop settings.'));
                        return;
                    }
                    uploadUrl = `https://api.filegarden.com/users/${encodeURIComponent(settings.filegardenUserId)}/pipe`;
                    fd.delete('reqtype');
                    fd.delete('url');
                    if (!(data instanceof File)) {
                        reject(new Error('File Garden drag upload supports files, not URL reposts.'));
                        return;
                    }
                    fd.delete('fileToUpload');
                    fd.append('file', data);
                }
                if (provider === 'cyctorn') {
                    uploadUrl = 'https://safe.cyctorn.tech/api/upload';
                    fd.delete('reqtype');
                    fd.delete('url');
                    if (!(data instanceof File)) {
                        reject(new Error('Cyctorn upload supports files only, not URL reposts.'));
                        return;
                    }
                    fd.delete('fileToUpload');
                    fd.append('files[]', data);
                }
                const headers = {};
                if (provider === 'filegarden' && settings.filegardenToken) headers.Authorization = settings.filegardenToken;
                if (provider === 'cyctorn' && settings.cyctornToken) headers.token = settings.cyctornToken;
                gmRequest({ method: 'POST', url: uploadUrl, data: fd, headers,
                    onload: r => {
                        const body = String(r.responseText || '').trim();
                        let u = body;
                        try {
                            const json = JSON.parse(body);
                            if (provider === 'cyctorn') {
                                u = json.files?.[0]?.url || body;
                            } else {
                                u = json.url || json.href || json.location || json.file || body;
                            }
                        } catch { }
                        try { new URL(u); resolve(u); } catch { reject(new Error(body || 'Upload failed')); }
                    },
                    onerror: reject });
            });
        }

        function attach(el) {
            if (el.dataset.epDrop) return;
            // Skip the script's own UI elements
            if (el.closest('#ep-panel, #ep-gif-picker, #ep-courtroom-bar, #ep-top-cover, #ep-chat-filter-bar')) return;
            el.dataset.epDrop = '1';
            el.addEventListener('dragover', e => {
                if (e.shiftKey || el.readOnly) return;
                const types = [...e.dataTransfer.types];
                if (!types.includes('Files') && !types.includes('text/plain')) return;
                e.preventDefault();
                if (!el.classList.contains('ep-dragover')) {
                    prevContent = el.value; prevSel = el.selectionStart;
                    setVal(el, `Drop to upload`);
                    el.classList.add('ep-dragover'); el.style.outline = '2px dashed #4caf50';
                }
            });
            el.addEventListener('dragleave', e => {
                if (el.contains(e.relatedTarget)) return;
                if (el.classList.contains('ep-dragover')) { cancel(el); }
            });
            el.addEventListener('drop', async e => {
                if (e.shiftKey) { cancel(el); return; }
                if (!el.classList.contains('ep-dragover')) return;
                e.preventDefault(); cancel(el);
                const payload = e.dataTransfer.getData('text/plain') || e.dataTransfer.files[0];
                if (!payload) return;
                setVal(el, 'Uploading…');
                try {
                    const url = await upload(payload);
                    setVal(el, prevContent.slice(0, prevSel) + url + prevContent.slice(prevSel));
                } catch (err) {
                    console.error('[Enhancer+] Upload error:', err);
                    setVal(el, prevContent);
                    showToast('Upload failed: ' + err.message);
                }
            });
        }
        function cancel(el) {
            setVal(el, prevContent); el.classList.remove('ep-dragover'); el.style.outline = '';
        }
        root.querySelectorAll(SEL).forEach(attach);
        new MutationObserver(muts => {
            for (const m of muts) for (const n of m.addedNodes)
                if (n.nodeType === 1) n.querySelectorAll?.(SEL).forEach(attach);
        }).observe(root, { childList: true, subtree: true });
    }

    // ─── Clock ────────────────────────────────────────────────────────
    let clockInterval = null;

    function initClock() {
        if (clockInterval) clearInterval(clockInterval);
        const el = document.getElementById('ep-clock');
        if (!el) return;
        if (!settings.showClock) { el.textContent = ''; return; }
        function tick() {
            const clockEl = document.getElementById('ep-clock');
            if (!clockEl) return;
            clockEl.textContent = new Date().toLocaleTimeString([], {
                hour: '2-digit', minute: '2-digit', second: '2-digit',
                hour12: !settings.clockFormat24h
            });
        }
        tick();
        clockInterval = setInterval(tick, 1000);
    }

    // ─── Now Playing ─────────────────────────────────────────────
    let nowPlayingEl = null;
    let npHideTimer = null;
    let currentMusicEl = null;

    function createNowPlaying() {
        nowPlayingEl = document.getElementById('ep-now-playing');
        if (!nowPlayingEl) {
            nowPlayingEl = document.createElement('div');
            nowPlayingEl.id = 'ep-now-playing';
            nowPlayingEl.innerHTML = `
                <span id="ep-now-playing-icon">♫</span>
                <span id="ep-now-playing-text">
                    <span id="ep-now-playing-label">Now Playing</span>
                    <span id="ep-now-playing-title">...</span>
                </span>`;
            document.body.appendChild(nowPlayingEl);
        }
    }

    function songNameFromUrl(src) {
        try {
            const path = new URL(src, location.href).pathname;
            const filename = path.split('/').pop() || '';
            return decodeURIComponent(filename)
                .replace(/\.[^.]+$/, '')
                .replace(/[-_]+/g, ' ')
                .replace(/\b\w/g, c => c.toUpperCase())
                .trim() || 'Unknown Track';
        } catch { return 'Unknown Track'; }
    }

    // Parse an ID3v2 TIT2 (title) tag from the first bytes of an audio file.
    function parseID3Title(bytes) {
        // Must start with "ID3"
        if (bytes[0] !== 0x49 || bytes[1] !== 0x44 || bytes[2] !== 0x33) return null;
        const ver = bytes[3]; // 2, 3, or 4
        const tagSize = ((bytes[6] & 0x7f) << 21) | ((bytes[7] & 0x7f) << 14) |
                        ((bytes[8] & 0x7f) << 7)  |  (bytes[9] & 0x7f);
        const idLen   = ver === 2 ? 3 : 4;
        const titleId = ver === 2 ? 'TT2' : 'TIT2';
        let offset = 10;
        while (offset + idLen + (ver === 2 ? 3 : 6) < Math.min(bytes.length, 10 + tagSize)) {
            const frameId = String.fromCharCode(...bytes.slice(offset, offset + idLen));
            if (!frameId.trim().replace(/\0/g, '')) break; // padding
            offset += idLen;
            let frameSize;
            if (ver === 2) {
                frameSize = (bytes[offset] << 16) | (bytes[offset+1] << 8) | bytes[offset+2];
                offset += 3;
            } else if (ver === 4) {
                frameSize = ((bytes[offset] & 0x7f) << 21) | ((bytes[offset+1] & 0x7f) << 14) |
                            ((bytes[offset+2] & 0x7f) << 7) | (bytes[offset+3] & 0x7f);
                offset += 6; // 4 size + 2 flags
            } else {
                frameSize = (bytes[offset] << 24) | (bytes[offset+1] << 16) |
                            (bytes[offset+2] << 8) | bytes[offset+3];
                offset += 6; // 4 size + 2 flags
            }
            if (frameId === titleId && frameSize > 1) {
                const enc      = bytes[offset];
                const textData = bytes.slice(offset + 1, offset + frameSize);
                let text;
                try {
                    if (enc === 0)      text = new TextDecoder('windows-1252').decode(textData);
                    else if (enc === 3) text = new TextDecoder('utf-8').decode(textData);
                    else if (enc === 2) text = new TextDecoder('utf-16be').decode(textData);
                    else                text = new TextDecoder('utf-16').decode(textData);
                } catch { text = Array.from(textData).map(b => String.fromCharCode(b)).join(''); }
                const clean = text.replace(/\0/g, '').trim();
                return clean || null;
            }
            offset += frameSize;
        }
        return null;
    }

    // Fetch the first 64 KB of an audio URL and try to extract the ID3 title.
    // Calls cb(title) where title is a string or null if not found / unavailable.
    function fetchSongTitle(src, cb) {
        if (!gmRequest) { cb(null); return; }
        try {
            gmRequest({
                method: 'GET',
                url: src,
                responseType: 'arraybuffer',
                headers: { Range: 'bytes=0-65535' },
                onload(resp) {
                    try { cb(parseID3Title(new Uint8Array(resp.response))); }
                    catch { cb(null); }
                },
                onerror()   { cb(null); },
                ontimeout() { cb(null); },
            });
        } catch { cb(null); }
    }

    const NP_MIN_DURATION = 4; // seconds - filters out blips and SFX

    function showNowPlayingWidget(src) {
        if (!settings.showNowPlaying) return;
        if (!nowPlayingEl) createNowPlaying();
        if (npHideTimer) { clearTimeout(npHideTimer); npHideTimer = null; }
        const titleEl = document.getElementById('ep-now-playing-title');
        // Show prettified filename immediately so the widget appears right away
        if (titleEl) titleEl.textContent = songNameFromUrl(src);
        nowPlayingEl.classList.add('visible');
        // Asynchronously fetch the real ID3 title and update if found
        fetchSongTitle(src, function(id3Title) {
            if (!id3Title) return;
            // Only update if this track is still the one playing
            const el = document.getElementById('ep-now-playing-title');
            if (el && nowPlayingEl && nowPlayingEl.classList.contains('visible')) {
                el.textContent = id3Title;
            }
        });
    }

    function maybeShowNowPlaying(el) {
        if (!settings.showNowPlaying) return;
        const check = () => {
            if (!isFinite(el.duration) || el.duration < NP_MIN_DURATION) return;
            currentMusicEl = el;
            showNowPlayingWidget(el.src);
        };
        if (el.readyState >= 1) check(); // metadata already available
        else el.addEventListener('loadedmetadata', check, { once: true });
    }

    function hideNowPlayingWidget() {
        if (!nowPlayingEl) return;
        if (npHideTimer) { clearTimeout(npHideTimer); npHideTimer = null; }
        currentMusicEl = null;
        nowPlayingEl.classList.remove('visible');
    }

    function hideNowPlayingIfCurrent(el) {
        if (el !== currentMusicEl) return;
        hideNowPlayingWidget();
    }

    function initNowPlaying() {
        createNowPlaying();
        // Hook HTMLMediaElement.play to catch all audio the game creates
        const origPlay = HTMLMediaElement.prototype.play;
        HTMLMediaElement.prototype.play = function (...args) {
            if (this.tagName === 'AUDIO' && this.src) {
                maybeShowNowPlaying(this);
                const onEnd = () => hideNowPlayingIfCurrent(this);
                this.addEventListener('ended',   onEnd, { once: true });
                this.addEventListener('emptied', onEnd, { once: true });
                this.addEventListener('pause', () => hideNowPlayingIfCurrent(this), { once: true });
            }
            return origPlay.apply(this, args);
        };
        // Also catch audio already in the DOM at load time
        document.querySelectorAll('audio').forEach(el => {
            if (!el.paused && el.src) maybeShowNowPlaying(el);
            el.addEventListener('play',  () => maybeShowNowPlaying(el));
            el.addEventListener('ended', () => hideNowPlayingIfCurrent(el));
            el.addEventListener('pause', () => hideNowPlayingIfCurrent(el));
        });
    }

    // ─── Chat filter ────────────────────────────────────────────────────────────────────
    function matchesChatFilter(username, text) {
        if (!filterMentions && !filterByUser) return true;
        const checks = [];
        if (filterMentions) {
            const me = (settings.myUsername || '').trim().toLowerCase();
            checks.push(me ? text.toLowerCase().includes(me) : false);
        }
        if (filterByUser) {
            checks.push(filterUser ? username.toLowerCase() === filterUser.toLowerCase() : true);
        }
        return checks.some(Boolean);
    }

    function applyFilter() {
        const chatList = findChatList();
        if (!chatList) return;
        let shown = 0, total = 0;
        chatList.querySelectorAll(':scope > li.ep-chat-msg').forEach(li => {
            total++;
            const user = li.getAttribute('data-ep-user') || '';
            const text = li.textContent || '';
            const passes = matchesChatFilter(user, text);
            li.classList.toggle('ep-filtered-out', !passes);
            if (passes) shown++;
        });
        const countEl = document.getElementById('ep-filter-count');
        if (countEl) {
            if (!filterMentions && !filterByUser) { countEl.textContent = ''; countEl.classList.remove('active'); }
            else { countEl.textContent = shown + '/' + total; countEl.classList.toggle('active', shown < total); }
        }
    }

    function createFilterBar() {
        if (document.getElementById('ep-chat-filter-bar')) return;
        const chatList = findChatList();
        if (!chatList) return;
        const bar = document.createElement('div');
        bar.id = 'ep-chat-filter-bar';
        bar.innerHTML = [
            '<button class="ep-filter-chip" data-filter="mentions">@Me</button>',
            '<button class="ep-filter-chip" data-filter="user">User</button>',
            '<input id="ep-filter-user-input" type="text" placeholder="username…" autocomplete="off" style="display:none">',
            '<span id="ep-filter-count"></span>',
        ].join('');
        bar.querySelectorAll('.ep-filter-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const f = chip.dataset.filter;
                const inp = document.getElementById('ep-filter-user-input');
                if (f === 'mentions') {
                    filterMentions = !filterMentions;
                    chip.classList.toggle('active', filterMentions);
                } else if (f === 'user') {
                    filterByUser = !filterByUser;
                    chip.classList.toggle('active', filterByUser);
                    if (inp) {
                        inp.style.display = filterByUser ? '' : 'none';
                        if (filterByUser) { inp.focus(); }
                        else { inp.value = ''; filterUser = ''; chip.textContent = 'User'; }
                    }
                }
                applyFilter();
            });
        });
        const inp = bar.querySelector('#ep-filter-user-input');
        if (inp) {
            inp.addEventListener('input', () => {
                filterUser = inp.value.trim();
                const uchip = bar.querySelector('[data-filter="user"]');
                if (uchip) uchip.textContent = filterUser ? 'User: ' + filterUser : 'User';
                applyFilter();
            });
            inp.addEventListener('keydown', e => {
                if (e.key === 'Escape') {
                    filterMentions = false; filterByUser = false; filterUser = '';
                    inp.value = ''; inp.style.display = 'none';
                    bar.querySelectorAll('.ep-filter-chip').forEach(ch => {
                        ch.classList.remove('active');
                        if (ch.dataset.filter === 'user') ch.textContent = 'User';
                    });
                    applyFilter();
                }
            });
        }
        const parent = chatList.parentElement;
        if (parent) parent.insertBefore(bar, chatList);
        else chatList.insertAdjacentElement('beforebegin', bar);
    }

    // ─── Reply bar ─────────────────────────────────────────────────────────────────────────────
    function getOrCreateReplyBar() {
        let bar = document.getElementById('ep-reply-bar');
        if (bar) return bar;
        bar = document.createElement('div');
        bar.id = 'ep-reply-bar';
        bar.innerHTML = `<span id="ep-reply-label">↩ Replying to <strong id="ep-reply-user"></strong>: <em id="ep-reply-preview"></em></span><button class="ep-reply-cancel" title="Cancel reply">×</button>`;
        bar.querySelector('.ep-reply-cancel').addEventListener('click', () => {
            pendingReplyTo = null;
            hideReplyBar();
        });
        // Try to inject it just above the chat input area
        const chatPanel = document.querySelector('#ep-chat-panel, [class*="chatPanel"], [class*="ChatPanel"]');
        const inputArea = document.querySelector('textarea, input[type="text"][placeholder]');
        const anchor = inputArea?.closest('form, [class*="input"], [class*="Input"]') || inputArea?.parentElement;
        if (anchor) anchor.prepend(bar);
        else document.body.appendChild(bar);
        return bar;
    }
    function showReplyBar(user, text) {
        const bar = getOrCreateReplyBar();
        bar.querySelector('#ep-reply-user').textContent = user;
        bar.querySelector('#ep-reply-preview').textContent = text.slice(0, 60) + (text.length > 60 ? '…' : '');
        bar.classList.add('visible');
    }
    function hideReplyBar() {
        document.getElementById('ep-reply-bar')?.classList.remove('visible');
    }

    // ─── Chat export ─────────────────────────────────────────────────────────────
    function exportChatLog() {
        const fmt = document.getElementById('ep-export-fmt')?.value || settings.exportFormat || 'txt';
        let content, mime, ext;
        if (fmt === 'json') {
            content = JSON.stringify(chatLog, null, 2);
            mime = 'application/json'; ext = 'json';
        } else if (fmt === 'md') {
            content = `# Chat Log — objection.lol\n\n` + chatLog.map(e => {
                const reply = e.replyTo ? `> ↩ **${e.replyTo.user}:** ${e.replyTo.text.slice(0,80)}\n` : '';
                const user = e.user ? `**${e.user}:** ` : '';
                return `${reply}*[${e.ts}]* ${user}${e.text}`;
            }).join('\n\n');
            mime = 'text/markdown'; ext = 'md';
        } else {
            content = chatLog.map(e => {
                const reply = e.replyTo ? `  [↩ ${e.replyTo.user}: ${e.replyTo.text.slice(0,60)}]\n` : '';
                const user = e.user ? `${e.user}: ` : '';
                return `${reply}[${e.ts}] ${user}${e.text}`;
            }).join('\n');
            mime = 'text/plain'; ext = 'txt';
        }
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([content], { type: mime }));
        a.download = `objection-chat-${Date.now()}.${ext}`;
        a.click();
        URL.revokeObjectURL(a.href);
        showToast(`Chat exported as .${ext}`);
    }

    // ─── Settings button injection ────────────────────────────────────────────────
    const NATIVE_TABS = ['Chat', 'Evidence', 'Backgrounds', 'Settings'];

    function createCourtroomBar() {
        if (document.getElementById('ep-courtroom-bar')) return;
        document.body.classList.add('ep-has-beop-bar');
        const bar = document.createElement('div');
        bar.id = 'ep-courtroom-bar';
        bar.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <span class="ep-bar-title">법 (Beop)</span>
                <span class="ep-bar-meta">objection.lol</span>
                <div id="ep-host-status">
                    <span class="ep-host-pill checking" id="ep-host-catbox"><span class="ep-host-dot"></span>Catbox</span>
                    <span class="ep-host-pill checking" id="ep-host-garden"><span class="ep-host-dot"></span>Garden</span>
                </div>
            </div>
            <div id="ep-native-tabs">
                ${NATIVE_TABS.map(tab => `<button class="ep-native-tab" type="button" data-native-tab="${tab.toLowerCase()}">${tab}</button>`).join('')}
                <button id="ep-trigger-btn" type="button">법</button>
            </div>
            <div id="ep-now-playing" class="ep-now-playing-integrated">
                <span id="ep-now-playing-icon">♫</span>
                <span id="ep-now-playing-text">
                    <span id="ep-now-playing-label">Now Playing</span>
                    <span id="ep-now-playing-title">...</span>
                </span>
            </div>`;
        bar.querySelectorAll('.ep-native-tab').forEach(btn => {
            btn.addEventListener('click', () => clickNativeTab(btn.dataset.nativeTab));
        });
        bar.querySelector('#ep-trigger-btn').addEventListener('click', togglePanel);
        document.body.appendChild(bar);
        startHostStatusRefresh();
        updateNativeTabbarVisibility();
        updateNativeExtraTabs();
        updateNativeTabState();
    }

    function getNativeExtraTabNames() {
        const standard = new Set(NATIVE_TABS.map(t => t.toLowerCase()));
        return [...document.querySelectorAll('button, [role="tab"]')]
            .map(btn => ({ btn, text: (btn.textContent || '').trim() }))
            .filter(({ btn, text }) => {
                if (!text) return false;
                const lower = text.toLowerCase();
                if (standard.has(lower)) return false;
                if (lower !== 'admin' && lower !== 'mod') return false;
                if (btn.closest('#ep-courtroom-bar') || btn.closest('#ep-panel')) return false;
                return btn.offsetParent !== null;
            })
            .map(({ text }) => text);
    }

    function updateNativeExtraTabs() {
        const tabContainer = document.getElementById('ep-native-tabs');
        if (!tabContainer) return;
        tabContainer.querySelectorAll('.ep-native-extra-tab').forEach(el => el.remove());
        const extras = getNativeExtraTabNames();
        const trigger = document.getElementById('ep-trigger-btn');
        extras.forEach(name => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'ep-native-tab ep-native-extra-tab';
            btn.dataset.nativeTab = name.toLowerCase();
            btn.textContent = name;
            btn.addEventListener('click', () => clickNativeTab(btn.dataset.nativeTab));
            if (trigger) trigger.insertAdjacentElement('beforebegin', btn);
        });
    }

    function createTopCover() {
        if (document.getElementById('ep-top-cover')) return;
        const cover = document.createElement('div');
        cover.id = 'ep-top-cover';
        cover.innerHTML = `
            <div class="ep-top-left">
                <button class="ep-top-btn" type="button" data-top-action="menu" title="Open courtroom menu">Menu</button>
                <strong>법</strong><span id="ep-room-title"></span>
            </div>
            <div class="ep-top-right">
                <button class="ep-top-btn" type="button" data-top-action="users" title="Users">Users</button>
                <span id="ep-clock"></span>
                <span class="ep-top-stat">msgs: <span id="ep-stat-msgs">0</span></span>
                <span class="ep-top-stat">users: <span id="ep-stat-users">—</span></span>
            </div>`;
        cover.querySelectorAll('.ep-top-btn').forEach(btn => {
            btn.addEventListener('click', () => clickNativeTopAction(btn.dataset.topAction));
        });
        document.body.appendChild(cover);
        updateNativeTopbarVisibility();
        updateRoomTitle();
        updateTopBarImage();
    }

    // ─── Radio Widget ─────────────────────────────────────────────────────────────
    function createRadioWidget() {
        if (document.getElementById('ep-radio-btn')) return;

        const btn = document.createElement('button');
        btn.id = 'ep-radio-btn';
        btn.type = 'button';
        btn.title = 'Toggle Cyctorn Radio';
        btn.textContent = 'CourtDog FM';
        document.body.appendChild(btn);

        const panel = document.createElement('div');
        panel.id = 'ep-radio-panel';
        panel.className = 'hidden';
        panel.innerHTML = `
            <button id="ep-radio-close" type="button" title="Close">✕</button>
            <div id="ep-radio-iframe-wrap">
                <iframe id="ep-radio-iframe"
                    src="https://radio.cyctorn.tech/"
                    allow="autoplay"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups"></iframe>
            </div>`;
        document.body.appendChild(panel);

        btn.addEventListener('click', () => {
            const isHidden = panel.classList.toggle('hidden');
            btn.classList.toggle('active', !isHidden);
        });

        panel.querySelector('#ep-radio-close').addEventListener('click', () => {
            panel.classList.add('hidden');
            btn.classList.remove('active');
        });
    }

    function updateTopBarImage() {
        const cover = document.getElementById('ep-top-cover');
        if (!cover) return;
        if (document.getElementById('ep-top-bar-img')) return; // already inserted
        const img = document.createElement('img');
        img.id = 'ep-top-bar-img';
        img.src = 'https://file.garden/aXsgVUzen0_D9K_F/beop.png';
        img.alt = '';
        const left = cover.querySelector('.ep-top-left');
        if (left) {
            const menuBtn = left.querySelector('[data-top-action="menu"]');
            if (menuBtn && menuBtn.nextSibling) {
                left.insertBefore(img, menuBtn.nextSibling);
            } else {
                left.appendChild(img);
            }
        }
    }

    function updateRoomTitle() {
        const titleEl = document.getElementById('ep-room-title');
        if (!titleEl) return;
        const title = document.title
            .replace(/\s*[-|]\s*objection\.lol.*$/i, '')
            .replace(/^objection\.lol\s*[-|]\s*/i, '')
            .trim();
        titleEl.textContent = title && !/^objection\.lol$/i.test(title) ? `- ${title}` : '';
    }

    function findNativeTabButton(tabName) {
        const wanted = tabName.toLowerCase();
        const buttons = [...document.querySelectorAll('button, [role="tab"]')].filter(btn => {
            if (btn.closest('#ep-courtroom-bar') || btn.closest('#ep-panel')) return false;
            return (btn.textContent || '').trim().toLowerCase() === wanted;
        });
        return buttons.find(btn => btn.offsetParent !== null) || buttons[0] || null;
    }

    function clickNativeTab(tabName) {
        const btn = findNativeTabButton(tabName);
        if (!btn) {
            showToast(`Couldn't find the ${tabName} tab yet.`);
            return;
        }
        btn.click();
        setTimeout(updateNativeTabState, 80);
    }

    function updateNativeTabState() {
        const bar = document.getElementById('ep-courtroom-bar');
        if (!bar) return;
        updateNativeTabbarVisibility();
        updateNativeExtraTabs();
        updateNativeTopbarVisibility();
        bar.querySelectorAll('.ep-native-tab').forEach(btn => {
            const native = findNativeTabButton(btn.dataset.nativeTab);
            const selected = native?.getAttribute('aria-selected') === 'true'
                || native?.classList.contains('Mui-selected');
            btn.classList.toggle('active', !!selected);
        });
    }

    function updateNativeTabbarVisibility() {
        const wanted = new Set(NATIVE_TABS.map(tab => tab.toLowerCase()));
        document.querySelectorAll('.ep-native-tabbar-hidden').forEach(el => el.classList.remove('ep-native-tabbar-hidden'));
        document.querySelectorAll('#root div[role="tablist"]').forEach(tablist => {
            if (tablist.closest('#ep-courtroom-bar') || tablist.closest('#ep-panel')) return;
            const labels = [...tablist.querySelectorAll('button, [role="tab"]')]
                .map(btn => (btn.textContent || '').trim().toLowerCase())
                .filter(Boolean);
            const matchesNativeMenu = [...wanted].every(label => labels.includes(label));
            if (matchesNativeMenu) tablist.classList.add('ep-native-tabbar-hidden');
        });
    }

    function updateNativeTopbarVisibility() {
        document.querySelectorAll('.ep-native-topbar-hidden').forEach(el => el.classList.remove('ep-native-topbar-hidden'));
        document.querySelectorAll('.MuiAppBar-root, header.MuiPaper-root.MuiAppBar-root').forEach(bar => {
            if (bar.closest('#ep-top-cover') || bar.closest('#ep-panel') || bar.closest('#ep-courtroom-bar')) return;
            const rect = bar.getBoundingClientRect();
            if (rect.top <= 48 && rect.bottom <= 96) bar.classList.add('ep-native-topbar-hidden');
        });
        // Remove prehide AFTER class is applied so there is no gap.
        const ph = document.getElementById('ep-prehide');
        if (ph) ph.remove();
    }

    function getNativeTopButtons() {
        updateNativeTopbarVisibility();
        const bars = [...document.querySelectorAll('.ep-native-topbar-hidden')];
        return bars.flatMap(bar => [...bar.querySelectorAll('button, [role="button"]')])
            .filter(btn => !btn.closest('#ep-top-cover') && !btn.closest('#ep-panel') && !btn.disabled);
    }

    function clickNativeTopAction(action) {
        const buttons = getNativeTopButtons();
        let target = null;
        if (action === 'menu') {
            target = buttons[0];
        } else if (action === 'users') {
            target = buttons.find(btn => /user|people|participant|member/i.test((btn.getAttribute('aria-label') || '') + ' ' + (btn.title || '') + ' ' + (btn.textContent || ''))) || buttons[1];
        } else if (action === 'viewers') {
            target = buttons.find(btn => /view|eye|spectator|watch/i.test((btn.getAttribute('aria-label') || '') + ' ' + (btn.title || '') + ' ' + (btn.textContent || ''))) || buttons[2];
        }
        if (!target) {
            showToast('Could not find that top-bar action yet.');
            return;
        }
        target.click();
    }

    let hostStatusInterval = null;

    function pingHost(pillId, url) {
        const pill = document.getElementById(pillId);
        if (!pill) return;
        pill.className = 'ep-host-pill checking';
        if (!gmRequest) { pill.className = 'ep-host-pill down'; return; }
        gmRequest({
            method: 'HEAD',
            url,
            timeout: 7000,
            onload:    r  => { pill.className = 'ep-host-pill ' + (r.status < 500 ? 'up' : 'down'); },
            onerror:   () => { pill.className = 'ep-host-pill down'; },
            ontimeout: () => { pill.className = 'ep-host-pill down'; },
        });
    }

    function updateHostStatus() {
        const container = document.getElementById('ep-host-status');
        if (!container) return;
        container.classList.toggle('visible', !!settings.showCatboxStatus);
        if (!settings.showCatboxStatus) return;
        pingHost('ep-host-catbox',  'https://catbox.moe/');
        pingHost('ep-host-garden',  'https://api.filegarden.com/');
    }

    function startHostStatusRefresh() {
        updateHostStatus();
        if (hostStatusInterval) clearInterval(hostStatusInterval);
        hostStatusInterval = setInterval(updateHostStatus, 30000);
    }

    function addSettingsButton(settingsTab) {
        if (!settingsTab) return;
        if (settingsTab.querySelector('#ep-tab-trigger-btn')) return;
        const btn = document.createElement('button');
        btn.id = 'ep-tab-trigger-btn';
        btn.textContent = '법 Settings';
        btn.addEventListener('click', togglePanel);
        settingsTab.prepend(btn);
    }

    // ─── Hotkeys ─────────────────────────────────────────────────────────────────
    document.addEventListener('keydown', ev => {
        if (ev.key === 'Escape' && Object.keys(activeFramePopups).length) {
            dismissAllFramePopups(true);
            ev.stopPropagation();
        }

        const inField = ['INPUT', 'TEXTAREA'].includes(ev.target.tagName) || ev.target.isContentEditable;

        // ADT block
        if (!inField && settings.disableHotkeys && 'adt'.includes(ev.key.toLowerCase())) {
            ev.preventDefault(); ev.stopImmediatePropagation();
        }

        // Enhancer hotkeys
        if (ev.ctrlKey && ev.shiftKey && ev.key === 'E') { ev.preventDefault(); togglePanel(); }
        if (ev.ctrlKey && !ev.shiftKey && ev.key === 'g' && !inField) { ev.preventDefault(); const gifBtn = document.querySelector('.ep-gif-btn'); if (gifBtn) { if (gifPickerOpen) closeGifPicker(); else openGifPicker(gifBtn); } }
        if (ev.ctrlKey && !ev.shiftKey && ev.key === 'f' && !inField) { ev.preventDefault(); openSearch(); }
        if (ev.ctrlKey && !ev.shiftKey && ev.key === 'k') {
            ev.preventDefault();
            // Find and click the objection.lol assets / evidence button.
            // Try common selectors used in the MUI-based UI.
            const assetSelectors = [
                '[aria-label*="asset" i]',
                '[aria-label*="evidence" i]',
                '[aria-label*="present" i]',
                '[title*="asset" i]',
                '[title*="evidence" i]',
                '[data-testid*="asset" i]',
                '[data-testid*="evidence" i]',
            ];
            let clicked = false;
            for (const sel of assetSelectors) {
                const btn = document.querySelector(sel);
                if (btn) { btn.click(); clicked = true; break; }
            }
            if (!clicked) showToast('Assets button not found — try clicking it once first');
        }
        if (ev.ctrlKey && ev.shiftKey && ev.key === 'S') {
            ev.preventDefault();
            autoScrollEnabled = !autoScrollEnabled;
            settings.autoScroll = autoScrollEnabled;
            saveSettings();
            updateScrollPausedIndicator();
            showToast('Auto-scroll ' + (autoScrollEnabled ? 'on' : 'paused'));
        }
        if (ev.key === 'Escape') {
            closePanel();
            closeSearch();
            clearHover();
            // Close any open native MUI drawer/modal (assets menu, etc.)
            const backdrop = document.querySelector('.MuiBackdrop-root:not([aria-hidden="true"])');
            if (backdrop) backdrop.click();
        }
        if (ev.ctrlKey && ev.shiftKey && ev.key === 'B') {
            ev.preventDefault();
            settings.backgroundEnabled = !settings.backgroundEnabled;
            saveSettings();
            applyBackground();
            showToast('Background ' + (settings.backgroundEnabled ? 'on' : 'off'));
        }
        if (ev.ctrlKey && ev.shiftKey && ev.key === 'C') {
            ev.preventDefault();
            settings.compactMode = !settings.compactMode;
            saveSettings();
            applyReskinCSS();
            showToast('Compact mode ' + (settings.compactMode ? 'on' : 'off'));
        }
        if (ev.ctrlKey && ev.shiftKey && ev.key === 'X') {
            ev.preventDefault();
            exportChatLog();
        }
        if (ev.ctrlKey && ev.shiftKey && ev.key === 'N') {
            ev.preventDefault();
            settings.showNowPlaying = !settings.showNowPlaying;
            saveSettings();
            if (!settings.showNowPlaying && nowPlayingEl) nowPlayingEl.classList.remove('visible');
            showToast('Now Playing widget ' + (settings.showNowPlaying ? 'on' : 'off'));
        }
    }, true);

    // ─── WebSocket intercept ─────────────────────────────────────────────────────
    let courtroomInitialized = false;

    function maybePlayLaughTrack(data) {
        if (typeof data !== 'string') return;
        if (!/laugh\s+track/i.test(data)) return;
        const now = Date.now();
        if (now - laughTrackLastPlayed < 1500) return;
        laughTrackLastPlayed = now;
        const laughTracks = [
            'https://file.garden/aXsgVUzen0_D9K_F/track1.mp3',
            'https://file.garden/aXsgVUzen0_D9K_F/track2.mp3',
            'https://file.garden/aXsgVUzen0_D9K_F/track3.mp3',
            'https://file.garden/aXsgVUzen0_D9K_F/track4.mp3',
            'https://file.garden/aXsgVUzen0_D9K_F/track5.mp3'
        ];
        const indices = laughTracks.map((_, i) => i).filter(i => i !== laughTrackLastIndex);
        laughTrackLastIndex = indices[Math.floor(Math.random() * indices.length)];
        try {
            const lt = new Audio(laughTracks[laughTrackLastIndex]);
            lt.play().catch(() => {});
        } catch {}
    }

    function interceptWebSocket() {
        const origSend = WebSocket.prototype.send;
        WebSocket.prototype.send = function (data) {
            if (typeof data === 'string' && data.startsWith('42[')) {
                try {
                    const payload = JSON.parse(data.slice(2));
                    scanSocketPayloadForContexts(payload);
                    switch (payload[0]) {
                        case 'me':
                            if (!courtroomInitialized) {
                                courtroomInitialized = true;
                                setTimeout(onCourtroomJoined, 800);
                            }
                            break;
                        case 'typing':
                            if (settings.suppressOwnTyping) return;
                            break;
                    }
                } catch { }
            }
            return origSend.call(this, data);
        };

        const origAddEventListener = WebSocket.prototype.addEventListener;
        WebSocket.prototype.addEventListener = function (type, listener, options) {
            if (type !== 'message' || typeof listener !== 'function') {
                return origAddEventListener.call(this, type, listener, options);
            }
            const wrapped = function (event) {
                try {
                    if (typeof event.data === 'string' && event.data.startsWith('42[')) {
                        scanSocketPayloadForContexts(JSON.parse(event.data.slice(2)));
                    }
                    maybePlayLaughTrack(event.data);
                } catch { }
                return listener.call(this, event);
            };
            return origAddEventListener.call(this, type, wrapped, options);
        };

        // Also intercept ws.onmessage = ... assignments (used by many frameworks)
        const onmsgDesc = Object.getOwnPropertyDescriptor(WebSocket.prototype, 'onmessage');
        if (onmsgDesc && onmsgDesc.set) {
            Object.defineProperty(WebSocket.prototype, 'onmessage', {
                get() { return onmsgDesc.get.call(this); },
                set(handler) {
                    if (typeof handler !== 'function') {
                        return onmsgDesc.set.call(this, handler);
                    }
                    onmsgDesc.set.call(this, function (event) {
                        try { maybePlayLaughTrack(event.data); } catch {}
                        return handler.call(this, event);
                    });
                },
                configurable: true,
            });
        }
    }

    // ─── Layout detection ─────────────────────────────────────────────────────────
    function isHorizontalLayout() {
        return !!document.querySelector('#root > .MuiContainer-root > .MuiGrid2-root.MuiGrid2-container');
    }

    // Returns the chat <ul> element directly rather than a frame container,
    // so startChatObserver doesn't need to do a second search inside a frame.
    function findChatList() {
        // Horizontal layout: the chat panel is the last MuiGrid2 column
        if (isHorizontalLayout()) {
            const container = document.querySelector('#root > .MuiContainer-root > .MuiGrid2-root.MuiGrid2-container');
            if (container) {
                // Scan columns right-to-left — chat is typically the rightmost
                const cols = [...container.querySelectorAll(':scope > .MuiGrid2-root')].reverse();
                for (const col of cols) {
                    const ul = col.querySelector('ul');
                    if (ul) return ul;
                }
            }
        }
        // Drawer layout
        const drawer = document.querySelector('body > div.MuiDrawer-root > div.MuiPaper-root');
        if (drawer) {
            const ul = drawer.querySelector('ul');
            if (ul) return ul;
        }
        // Generic fallback: pick the <ul> inside #root with the most <li> children
        let best = null, bestN = 0;
        document.querySelectorAll('#root ul').forEach(ul => {
            const n = ul.querySelectorAll(':scope > li').length;
            if (n > bestN) { bestN = n; best = ul; }
        });
        return best; // null if no messages yet — poller will retry
    }

    function findSettingsTab() {
        const allTabs = document.querySelectorAll('div[role=tablist] button');
        const settingsTabBtn = [...allTabs].find(t => t.textContent.toLowerCase().trim() === 'settings');
        if (!settingsTabBtn) return null;
        const idx = [...settingsTabBtn.parentElement.children].indexOf(settingsTabBtn);
        const panels = document.querySelectorAll('div[role=tabpanel]');
        return panels[idx] || null;
    }

    // ─── OOC chat message splitter + character counter ────────────────────────────
    // Auto-splits messages over 479 chars into multiple sends.
    // Also shows a live character counter next to the OOC chat input.
    function initChatSplitter(root) {
        const LIMIT = 479;
        const OOC_SEL = `input[type="text"].MuiInputBase-input, textarea.MuiInputBase-inputMultiline, input[type="text"].MuiFilledInput-input`;

        // React-compatible value setter
        function setReactVal(el, v) {
            const proto = Object.getPrototypeOf(el);
            const desc = Object.getOwnPropertyDescriptor(proto, 'value');
            desc?.set?.call(el, v);
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
        }

        // Split text into chunks ≤ limit, breaking at word boundaries when possible
        function splitMessage(text, limit) {
            const chunks = [];
            while (text.length > 0) {
                if (text.length <= limit) { chunks.push(text); break; }
                let cut = limit;
                const spaceIdx = text.lastIndexOf(' ', limit);
                if (spaceIdx > limit * 0.5) cut = spaceIdx;
                chunks.push(text.slice(0, cut));
                text = text.slice(cut).trimStart();
            }
            return chunks;
        }

        // Find the send button nearest to a given input (rightmost/below it)
        function findSendBtn(inputEl) {
            const iRect = inputEl.getBoundingClientRect();
            const SKIP = ['ep-gif-btn', 'ep-native-tab', 'ep-top-btn', 'ep-btn', 'ep-msg-btn'];
            const candidates = [...document.querySelectorAll('#root button')].filter(b => {
                if (b.disabled) return false;
                if (SKIP.some(c => b.classList.contains(c))) return false;
                if (b.closest('#ep-gif-picker,#ep-panel,#ep-courtroom-bar,#ep-top-cover')) return false;
                const r = b.getBoundingClientRect();
                if (!r.width || !r.height) return false;
                const vOverlap = Math.max(0, Math.min(r.bottom, iRect.bottom + 40) - Math.max(r.top, iRect.top - 4));
                return vOverlap > 0 && r.left >= iRect.right - 8;
            });
            if (!candidates.length) return null;
            candidates.sort((a, b) => a.getBoundingClientRect().left - b.getBoundingClientRect().left);
            return candidates[candidates.length - 1];
        }

        async function sendChunks(chunks, inputEl) {
            for (let i = 0; i < chunks.length; i++) {
                if (i > 0) await new Promise(r => setTimeout(r, 850));
                setReactVal(inputEl, chunks[i]);
                inputEl.focus();
                await new Promise(r => setTimeout(r, 60));
                const btn = findSendBtn(inputEl);
                if (btn) {
                    btn.click();
                } else {
                    // Fallback: dispatch Enter key events
                    ['keydown', 'keypress', 'keyup'].forEach(t =>
                        inputEl.dispatchEvent(new KeyboardEvent(t, {
                            key: 'Enter', code: 'Enter', keyCode: 13, which: 13,
                            bubbles: true, cancelable: true,
                        }))
                    );
                }
            }
        }

        // ── Character counter badge ──
        let counterEl = null;
        let counterTarget = null;

        function updateCounter(inputEl) {
            if (!counterEl) {
                counterEl = document.createElement('span');
                counterEl.id = 'ep-chat-char-counter';
                // Plain, unobtrusive text sitting just below the right edge of the input.
                // position:fixed so viewport coords map directly without scroll offsets.
                counterEl.style.cssText = [
                    'position:fixed',
                    'font-size:10px', 'font-family:monospace', 'pointer-events:none',
                    'z-index:9999', 'color:#888', 'line-height:1',
                    'user-select:none',
                ].join(';');
                document.body.appendChild(counterEl);
            }
            if (!inputEl || !inputEl.isConnected) {
                counterEl.style.display = 'none';
                counterTarget = null;
                return;
            }
            counterTarget = inputEl;
            const len = inputEl.value.length;
            const r = inputEl.getBoundingClientRect();
            counterEl.style.display = len > 0 ? '' : 'none';
            // Place it just below the right edge of the input
            counterEl.style.left = (r.right - 52) + 'px';
            counterEl.style.top  = (r.bottom + 2) + 'px';
            counterEl.textContent = len + '/' + LIMIT;
            counterEl.style.color = len > LIMIT ? '#f66' : len > LIMIT * 0.85 ? '#fa0' : '#888';
        }

        // ── Splitter attachment ──
        const attached = new WeakSet();

        function attachSplitter(inputEl) {
            if (attached.has(inputEl)) return;
            attached.add(inputEl);

            // Remove the site's native maxLength cap so arbitrarily long messages can
            // be typed and then auto-split. Watch for React re-applying it.
            function liftMaxLength(el) {
                if (el.maxLength > 0 && el.maxLength < 9000) {
                    try { el.removeAttribute('maxlength'); } catch (_) {}
                    try { el.maxLength = 99999; } catch (_) {}
                }
            }
            liftMaxLength(inputEl);
            new MutationObserver(() => liftMaxLength(inputEl))
                .observe(inputEl, { attributes: true, attributeFilter: ['maxlength'] });

            // Live character counter
            inputEl.addEventListener('input', () => updateCounter(inputEl));
            inputEl.addEventListener('focus', () => updateCounter(inputEl));
            inputEl.addEventListener('blur', () => {
                setTimeout(() => {
                    if (document.activeElement !== counterTarget) {
                        if (counterEl) counterEl.style.display = 'none';
                    }
                }, 150);
            });

            // Enter-key interceptor (capture phase, runs before React)
            inputEl.addEventListener('keydown', async function(e) {
                if (e.key !== 'Enter' || e.shiftKey) return;
                const msg = inputEl.value;
                if (msg.length <= LIMIT) return; // short enough — let native handle it
                e.preventDefault();
                e.stopImmediatePropagation();
                const chunks = splitMessage(msg, LIMIT);
                showToast(`Message too long — splitting into ${chunks.length} parts`);
                setReactVal(inputEl, '');
                if (counterEl) counterEl.style.display = 'none';
                await sendChunks(chunks, inputEl);
            }, true);
        }

        // Attach to any matching OOC input that is currently (or becomes) in the DOM
        root.querySelectorAll(OOC_SEL).forEach(el => {
            if (!el.closest('#ep-panel,#ep-gif-picker,#ep-courtroom-bar,#ep-top-cover,#ep-chat-filter-bar')) attachSplitter(el);
        });
        new MutationObserver(muts => {
            for (const m of muts) for (const n of m.addedNodes) {
                if (n.nodeType !== 1) continue;
                n.querySelectorAll?.(OOC_SEL).forEach(el => {
                    if (!el.closest('#ep-panel,#ep-gif-picker,#ep-courtroom-bar,#ep-top-cover,#ep-chat-filter-bar')) attachSplitter(el);
                });
                if (n.matches?.(OOC_SEL)) {
                    if (!n.closest('#ep-panel,#ep-gif-picker,#ep-courtroom-bar,#ep-top-cover,#ep-chat-filter-bar')) attachSplitter(n);
                }
            }
        }).observe(root, { childList: true, subtree: true });
    }

    function onCourtroomJoined() {
        applyReskinCSS();
        createCourtroomBar();
        createTopCover();

        const chatList = findChatList();
        createFilterBar();
        startChatObserver(chatList);

        const settingsTab = findSettingsTab();
        addSettingsButton(settingsTab);

        const appRoot = document.getElementById('root') || document.body;
        initDragUpload(appRoot);
        initGifPickerBtn(appRoot);
        initChatSplitter(appRoot);
        createRadioWidget();
        startLayoutWatcher();
        applyChatFonts();
        tagStaticFontZones();
    }

    let epLayoutMo = null;
    let epLayoutTick = 0;

    function startLayoutWatcher() {
        if (epLayoutMo) return;
        const root = document.getElementById('root') || document.body;
        epLayoutMo = new MutationObserver(() => {
            if (epLayoutTick) return;
            epLayoutTick = window.setTimeout(() => {
                epLayoutTick = 0;
                if (!chatObserver || !chatListEl?.isConnected) {
                    if (!document.getElementById('ep-chat-filter-bar')) createFilterBar();
                    const cl = findChatList();
                    if (cl) startChatObserver(cl);
                }
                const st = findSettingsTab();
                if (st) addSettingsButton(st);
                updateNativeTabState();
                updateStatusBar();
                updateRoomTitle();
                syncComposerToolbarTheme();
                tagComposerTextentry();
                applyChatFonts();
                tagStaticFontZones();
            }, 2000);
        });
        epLayoutMo.observe(root, { childList: true, subtree: true });
    }

    // ─── Evidence click intercept (auto-confirm delete) ───────────────────────────
    document.documentElement.addEventListener('click', e => {
        const del = e.target.closest("button[title='Delete Evidence']");
        if (del) {
            const yes = [...del.closest('.MuiPaper-root').querySelectorAll('button')].find(b => b.textContent.trim() === 'Yes');
            yes?.click();
        }
    });

    // ─── Init ─────────────────────────────────────────────────────────────────────
    function init() {
        settings = loadSettings();
        autoScrollEnabled = settings.autoScroll !== false;

        // Inject base styles
        const style = document.createElement('style');
        style.id = 'ep-base-styles';
        style.textContent = buildStyles();
        document.head.appendChild(style);

        // Leave warning
        if (settings.leaveWarning) {
            window.addEventListener('beforeunload', e => { e.preventDefault(); return ''; }, false);
        }

        // Evidence fix
        updateEvidenceFix();

        // Create UI elements
        createPanel();
        createCourtroomBar();
        createTopCover();
        createStatusBar();
        createScrollPausedIndicator();
        createMentionToast();

        // Notification sound
        notificationSound.setAudio(settings.notificationSoundUrl, settings.notificationSoundVolume);

        // Intercept WebSocket
        interceptWebSocket();

        // Apply reskin immediately (in case page already partially loaded)
        applyReskinCSS();
        applyCustomCSS();
        applyBackground();
        initClock();
        initNowPlaying();
        initFrameTextAnimation();
        createRadioWidget();
        // Apply body-class-based toggles that don't depend on reskin being on
        document.body.classList.toggle('ep-hide-ctx', settings.showMsgContext === false);
        document.body.classList.toggle('ep-threading', !!settings.threadingEnabled);

        // Poll every 500 ms until the chat frame appears (handles page refreshes
        // mid-session or cases where the WS 'me' event fired before our intercept)
        let _epRetries = 0;
        const _epPoller = setInterval(() => {
            if (courtroomInitialized || ++_epRetries > 60) { clearInterval(_epPoller); return; }
            if (findChatList()) { clearInterval(_epPoller); courtroomInitialized = true; onCourtroomJoined(); }
        }, 500);
    }

    // init() needs a fully-loaded DOM (document.head, document.body, React).
    // Deferring to 'load' replicates the old document-idle timing while
    // letting the pre-hide style at the top of this IIFE run immediately
    // at document-start, before any native bars are painted.
    if (document.readyState === 'complete') {
        init();
    } else {
        window.addEventListener('load', init);
    }

})();