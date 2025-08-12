import React from 'react';
import { FormFieldWrapper } from '@plone/volto/components';
import { Button, Modal, Header, Input } from 'semantic-ui-react';
import 'remixicon/fonts/remixicon.css';
// Most commonly used Remix icons grouped by category
const iconCategories = {
  Arrows: [
    'arrow-left-line',
    'arrow-right-line',
    'arrow-up-line',
    'arrow-down-line',
    'arrow-left-s-line',
    'arrow-right-s-line',
    'arrow-up-s-line',
    'arrow-down-s-line',
    'arrow-left-circle-line',
    'arrow-right-circle-line',
    'arrow-up-circle-line',
    'arrow-down-circle-line',
    'arrow-go-back-line',
    'arrow-go-forward-line',
    'corner-up-left-line',
    'corner-up-right-line',
    'corner-down-left-line',
    'corner-down-right-line',
    'refresh-line',
    'repeat-line',
    'exchange-line',
    'arrow-left-right-line',
    'arrow-up-down-line',
    'expand-left-right-line',
    'expand-up-down-line',
    'contract-left-right-line',
    'contract-up-down-line',
    'arrow-drop-left-line',
    'arrow-drop-right-line',
    'arrow-drop-up-line',
    'arrow-drop-down-line',
    'skip-left-line',
    'skip-right-line',
    'speed-line',
    'speed-mini-line',
    'drag-move-line',
    'drag-move-2-line',
  ],
  Interface: [
    'close-line',
    'add-line',
    'subtract-line',
    'check-line',
    'checkbox-line',
    'checkbox-blank-line',
    'checkbox-circle-line',
    'radio-button-line',
    'toggle-line',
    'menu-line',
    'menu-2-line',
    'menu-3-line',
    'menu-4-line',
    'menu-5-line',
    'menu-fold-line',
    'menu-unfold-line',
    'more-line',
    'more-2-line',
    'settings-line',
    'settings-2-line',
    'settings-3-line',
    'settings-4-line',
    'settings-5-line',
    'settings-6-line',
    'search-line',
    'search-2-line',
    'search-eye-line',
    'filter-line',
    'filter-2-line',
    'filter-3-line',
    'filter-off-line',
    'home-line',
    'home-2-line',
    'home-3-line',
    'home-4-line',
    'home-5-line',
    'home-6-line',
    'home-7-line',
    'home-8-line',
    'home-heart-line',
    'home-smile-line',
    'home-wifi-line',
    'dashboard-line',
    'dashboard-2-line',
    'dashboard-3-line',
    'apps-line',
    'apps-2-line',
    'grid-line',
    'layout-line',
    'layout-2-line',
    'layout-3-line',
    'layout-4-line',
    'layout-5-line',
    'layout-6-line',
    'layout-column-line',
    'layout-row-line',
    'layout-grid-line',
    'layout-masonry-line',
    'lock-line',
    'lock-2-line',
    'lock-password-line',
    'unlock-line',
    'eye-line',
    'eye-2-line',
    'eye-off-line',
    'eye-close-line',
    'fullscreen-line',
    'fullscreen-exit-line',
    'zoom-in-line',
    'zoom-out-line',
    'focus-line',
    'focus-2-line',
    'focus-3-line',
    'loader-line',
    'loader-2-line',
    'loader-3-line',
    'loader-4-line',
    'loader-5-line',
    'refresh-line',
    'restart-line',
    'shut-down-line',
    'logout-box-line',
    'logout-box-r-line',
    'login-box-line',
    'external-link-line',
    'link-line',
    'link-unlink-line',
    'attachment-line',
    'window-line',
    'window-2-line',
    'sidebar-fold-line',
    'sidebar-unfold-line',
    'split-cells-horizontal',
    'split-cells-vertical',
    'equalizer-line',
    'sound-module-line',
    'function-line',
    'command-line',
    'terminal-line',
    'terminal-box-line',
    'terminal-window-line',
    'bug-line',
    'bug-2-line',
    'code-line',
    'code-s-line',
    'code-s-slash-line',
    'code-box-line',
  ],
  Communication: [
    'mail-line',
    'mail-add-line',
    'mail-check-line',
    'mail-close-line',
    'mail-download-line',
    'mail-forbid-line',
    'mail-lock-line',
    'mail-open-line',
    'mail-send-line',
    'mail-settings-line',
    'mail-star-line',
    'mail-unread-line',
    'mail-volume-line',
    'inbox-line',
    'inbox-archive-line',
    'inbox-unarchive-line',
    'phone-line',
    'phone-camera-line',
    'phone-find-line',
    'phone-lock-line',
    'chat-line',
    'chat-1-line',
    'chat-2-line',
    'chat-3-line',
    'chat-4-line',
    'chat-check-line',
    'chat-delete-line',
    'chat-download-line',
    'chat-follow-up-line',
    'chat-forward-line',
    'chat-heart-line',
    'chat-history-line',
    'chat-new-line',
    'chat-off-line',
    'chat-poll-line',
    'chat-private-line',
    'chat-quote-line',
    'chat-settings-line',
    'chat-smile-line',
    'chat-smile-2-line',
    'chat-smile-3-line',
    'chat-upload-line',
    'chat-voice-line',
    'message-line',
    'message-2-line',
    'message-3-line',
    'notification-line',
    'notification-2-line',
    'notification-3-line',
    'notification-4-line',
    'notification-badge-line',
    'notification-off-line',
    'at-line',
    'share-line',
    'share-box-line',
    'share-circle-line',
    'share-forward-line',
    'share-forward-2-line',
    'share-forward-box-line',
    'send-plane-line',
    'send-plane-2-line',
    'send-backward',
    'send-to-back',
    'reply-line',
    'reply-all-line',
    'broadcast-line',
    'rss-line',
    'customer-service-line',
    'customer-service-2-line',
    'feedback-line',
    'discuss-line',
    'question-answer-line',
    'questionnaire-line',
    'video-chat-line',
    'voiceprint-line',
    'speak-line',
    'megaphone-line',
  ],
  Media: [
    'play-line',
    'play-circle-line',
    'play-list-line',
    'play-list-2-line',
    'play-list-add-line',
    'pause-line',
    'pause-circle-line',
    'stop-line',
    'stop-circle-line',
    'skip-forward-line',
    'skip-back-line',
    'speed-up-line',
    'slow-down-line',
    'rewind-line',
    'forward-10-line',
    'forward-15-line',
    'forward-30-line',
    'forward-5-line',
    'replay-10-line',
    'replay-15-line',
    'replay-30-line',
    'replay-5-line',
    'volume-up-line',
    'volume-down-line',
    'volume-mute-line',
    'volume-off-vibrate-line',
    'volume-vibrate-line',
    'music-line',
    'music-2-line',
    'album-line',
    'disc-line',
    'dvd-line',
    'video-line',
    'video-add-line',
    'video-download-line',
    'video-upload-line',
    'vidicon-line',
    'vidicon-2-line',
    'movie-line',
    'movie-2-line',
    'film-line',
    'clapperboard-line',
    'camera-line',
    'camera-2-line',
    'camera-3-line',
    'camera-lens-line',
    'camera-off-line',
    'camera-switch-line',
    'polaroid-line',
    'polaroid-2-line',
    'webcam-line',
    'webcam-2-line',
    'image-line',
    'image-2-line',
    'image-add-line',
    'image-edit-line',
    'gallery-line',
    'gallery-upload-line',
    'landscape-line',
    'picture-in-picture-line',
    'picture-in-picture-2-line',
    'picture-in-picture-exit-line',
    'aspect-ratio-line',
    'mic-line',
    'mic-2-line',
    'mic-off-line',
    'headphone-line',
    'speaker-line',
    'speaker-2-line',
    'speaker-3-line',
    'surround-sound-line',
    'radio-line',
    'radio-2-line',
    'broadcast-line',
    'notification-sound-line',
    'sound-module-line',
    'equalizer-line',
    'equalizer-2-line',
    'equalizer-3-line',
    'rhythm-line',
    'live-line',
    'hd-line',
    '4k-line',
    'closed-captioning-line',
    'subtitles-line',
    'voiceprint-line',
    'record-circle-line',
    'tape-line',
    'mv-line',
    'slideshow-line',
    'slideshow-2-line',
    'slideshow-3-line',
    'slideshow-4-line',
  ],
  Files: [
    'file-line',
    'file-2-line',
    'file-3-line',
    'file-4-line',
    'file-add-line',
    'file-chart-line',
    'file-chart-2-line',
    'file-cloud-line',
    'file-code-line',
    'file-copy-line',
    'file-copy-2-line',
    'file-damage-line',
    'file-download-line',
    'file-edit-line',
    'file-excel-line',
    'file-excel-2-line',
    'file-forbid-line',
    'file-gif-line',
    'file-history-line',
    'file-hwp-line',
    'file-info-line',
    'file-list-line',
    'file-list-2-line',
    'file-list-3-line',
    'file-lock-line',
    'file-marked-line',
    'file-music-line',
    'file-paper-line',
    'file-paper-2-line',
    'file-pdf-line',
    'file-pdf-2-line',
    'file-ppt-line',
    'file-ppt-2-line',
    'file-reduce-line',
    'file-search-line',
    'file-settings-line',
    'file-shield-line',
    'file-shield-2-line',
    'file-shred-line',
    'file-text-line',
    'file-transfer-line',
    'file-unknow-line',
    'file-upload-line',
    'file-user-line',
    'file-warning-line',
    'file-word-line',
    'file-word-2-line',
    'file-zip-line',
    'folder-line',
    'folder-2-line',
    'folder-3-line',
    'folder-4-line',
    'folder-5-line',
    'folder-add-line',
    'folder-chart-line',
    'folder-chart-2-line',
    'folder-download-line',
    'folder-forbid-line',
    'folder-history-line',
    'folder-info-line',
    'folder-keyhole-line',
    'folder-lock-line',
    'folder-music-line',
    'folder-open-line',
    'folder-received-line',
    'folder-reduce-line',
    'folder-settings-line',
    'folder-shared-line',
    'folder-shield-line',
    'folder-shield-2-line',
    'folder-transfer-line',
    'folder-unknow-line',
    'folder-upload-line',
    'folder-user-line',
    'folder-warning-line',
    'folder-zip-line',
    'folders-line',
    'download-line',
    'download-2-line',
    'download-cloud-line',
    'download-cloud-2-line',
    'upload-line',
    'upload-2-line',
    'upload-cloud-line',
    'upload-cloud-2-line',
    'save-line',
    'save-2-line',
    'save-3-line',
    'edit-line',
    'edit-2-line',
    'edit-box-line',
    'edit-circle-line',
    'delete-bin-line',
    'delete-bin-2-line',
    'delete-bin-3-line',
    'delete-bin-4-line',
    'delete-bin-5-line',
    'delete-bin-6-line',
    'delete-bin-7-line',
    'delete-back-line',
    'delete-back-2-line',
    'clipboard-line',
    'survey-line',
    'article-line',
    'newspaper-line',
    'sticky-note-line',
    'sticky-note-2-line',
    'draft-line',
    'book-line',
    'book-2-line',
    'book-3-line',
    'book-marked-line',
    'book-open-line',
    'book-read-line',
    'booklet-line',
    'bookmark-line',
    'bookmark-2-line',
    'bookmark-3-line',
    'contacts-book-line',
    'contacts-book-2-line',
    'contacts-book-upload-line',
    'pages-line',
    'todo-line',
    'task-line',
  ],
  User: [
    'user-line',
    'user-2-line',
    'user-3-line',
    'user-4-line',
    'user-5-line',
    'user-6-line',
    'user-add-line',
    'user-follow-line',
    'user-heart-line',
    'user-location-line',
    'user-received-line',
    'user-received-2-line',
    'user-search-line',
    'user-settings-line',
    'user-shared-line',
    'user-shared-2-line',
    'user-smile-line',
    'user-star-line',
    'user-unfollow-line',
    'user-voice-line',
    'account-box-line',
    'account-circle-line',
    'account-pin-box-line',
    'account-pin-circle-line',
    'admin-line',
    'aliens-line',
    'bear-smile-line',
    'body-scan-line',
    'contacts-line',
    'criminal-line',
    'emotion-line',
    'emotion-2-line',
    'emotion-happy-line',
    'emotion-laugh-line',
    'emotion-normal-line',
    'emotion-sad-line',
    'emotion-unhappy-line',
    'ghost-line',
    'ghost-2-line',
    'ghost-smile-line',
    'group-line',
    'group-2-line',
    'men-line',
    'women-line',
    'open-arm-line',
    'parent-line',
    'robot-line',
    'robot-2-line',
    'skull-line',
    'skull-2-line',
    'spy-line',
    'star-smile-line',
    'team-line',
    'travesti-line',
    'login-box-line',
    'login-circle-line',
    'logout-box-line',
    'logout-box-r-line',
    'logout-circle-line',
    'logout-circle-r-line',
    'vip-line',
    'vip-crown-line',
    'vip-crown-2-line',
    'vip-diamond-line',
  ],
  Business: [
    'shopping-cart-line',
    'shopping-cart-2-line',
    'shopping-bag-line',
    'shopping-bag-2-line',
    'shopping-bag-3-line',
    'shopping-basket-line',
    'shopping-basket-2-line',
    'money-dollar-circle-line',
    'money-dollar-box-line',
    'money-euro-circle-line',
    'money-euro-box-line',
    'money-pound-circle-line',
    'money-pound-box-line',
    'money-cny-circle-line',
    'money-cny-box-line',
    'money-rupee-circle-line',
    'exchange-dollar-line',
    'exchange-cny-line',
    'exchange-funds-line',
    'exchange-line',
    'exchange-box-line',
    'increase-decrease-line',
    'percent-line',
    'price-tag-line',
    'price-tag-2-line',
    'price-tag-3-line',
    'vip-diamond-line',
    'vip-crown-line',
    'vip-crown-2-line',
    'wallet-line',
    'wallet-2-line',
    'wallet-3-line',
    'bank-card-line',
    'bank-card-2-line',
    'secure-payment-line',
    'refund-line',
    'refund-2-line',
    'safe-line',
    'safe-2-line',
    'coin-line',
    'coins-line',
    'copper-coin-line',
    'copper-diamond-line',
    'gift-line',
    'gift-2-line',
    'coupon-line',
    'coupon-2-line',
    'coupon-3-line',
    'coupon-4-line',
    'coupon-5-line',
    'ticket-line',
    'ticket-2-line',
    'auction-line',
    'trophy-line',
    'medal-line',
    'medal-2-line',
    'award-line',
    'briefcase-line',
    'briefcase-2-line',
    'briefcase-3-line',
    'briefcase-4-line',
    'briefcase-5-line',
    'service-line',
    'building-line',
    'building-2-line',
    'building-3-line',
    'building-4-line',
    'ancient-gate-line',
    'ancient-pavilion-line',
    'bank-line',
    'store-line',
    'store-2-line',
    'store-3-line',
    'hotel-line',
    'community-line',
    'government-line',
    'hospital-line',
    'home-office-line',
    'pie-chart-line',
    'pie-chart-2-line',
    'pie-chart-box-line',
    'bar-chart-line',
    'bar-chart-2-line',
    'bar-chart-box-line',
    'bar-chart-grouped-line',
    'bar-chart-horizontal-line',
    'bubble-chart-line',
    'donut-chart-line',
    'line-chart-line',
    'stock-line',
    'funds-line',
    'funds-box-line',
    'archive-line',
    'archive-drawer-line',
    'at-line',
    'attachment-line',
    'attachment-2-line',
    'calculator-line',
    'calendar-line',
    'calendar-2-line',
    'calendar-check-line',
    'calendar-close-line',
    'calendar-event-line',
    'calendar-todo-line',
    'cloud-line',
    'cloud-off-line',
    'cloud-windy-line',
    'cloudy-line',
    'cloudy-2-line',
    'copyright-line',
    'copyleft-line',
    'creative-commons-line',
    'creative-commons-by-line',
    'creative-commons-nc-line',
    'creative-commons-nd-line',
    'creative-commons-sa-line',
    'creative-commons-zero-line',
    'customer-service-line',
    'customer-service-2-line',
    'flag-line',
    'flag-2-line',
    'global-line',
    'honour-line',
    'inbox-line',
    'inbox-archive-line',
    'inbox-unarchive-line',
    'links-line',
    'mail-line',
    'mail-open-line',
    'mail-send-line',
    'mail-star-line',
    'mail-volume-line',
    'medal-line',
    'medal-2-line',
    'pass-expired-line',
    'pass-pending-line',
    'pass-valid-line',
    'printer-line',
    'printer-cloud-line',
    'profile-line',
    'projector-line',
    'projector-2-line',
    'record-mail-line',
    'reply-line',
    'reply-all-line',
    'scan-line',
    'scan-2-line',
    'send-plane-line',
    'send-plane-2-line',
    'slideshow-line',
    'slideshow-2-line',
    'slideshow-3-line',
    'slideshow-4-line',
    'stack-line',
    'stack-overflow-line',
    'trademark-line',
    'window-line',
    'window-2-line',
  ],
  Social: [
    'facebook-line',
    'facebook-box-line',
    'facebook-circle-line',
    'twitter-line',
    'twitter-x-line',
    'instagram-line',
    'linkedin-line',
    'linkedin-box-line',
    'youtube-line',
    'github-line',
    'gitlab-line',
    'google-line',
    'whatsapp-line',
    'telegram-line',
    'telegram-2-line',
    'reddit-line',
    'tiktok-line',
    'snapchat-line',
    'pinterest-line',
    'paypal-line',
    'spotify-line',
    'soundcloud-line',
    'tumblr-line',
    'twitch-line',
    'vimeo-line',
    'slack-line',
    'messenger-line',
    'qq-line',
    'wechat-line',
    'wechat-2-line',
    'wechat-pay-line',
    'alipay-line',
    'amazon-line',
    'apple-line',
    'android-line',
    'windows-line',
    'behance-line',
    'behance-2-line',
    'dribbble-line',
    'dropbox-line',
    'evernote-line',
    'firefox-line',
    'chrome-line',
    'safari-line',
    'opera-line',
    'edge-line',
    'ie-line',
    'baidu-line',
    'discord-line',
    'disqus-line',
    'douban-line',
    'finder-line',
    'flutter-line',
    'github-line',
    'gitlab-line',
    'google-play-line',
    'medium-line',
    'microsoft-line',
    'netflix-line',
    'notion-line',
    'npm-line',
    'patreon-line',
    'product-hunt-line',
    'reactjs-line',
    'remixicon-line',
    'skype-line',
    'stack-overflow-line',
    'steam-line',
    'taobao-line',
    'trello-line',
    'uber-line',
    'unsplash-line',
    'vuejs-line',
    'xbox-line',
    'xing-line',
    'youtube-line',
    'zcool-line',
    'zhihu-line',
    'bilibili-line',
    'bilibili-2-line',
  ],
  Location: [
    'map-pin-line',
    'map-pin-2-line',
    'map-pin-3-line',
    'map-pin-4-line',
    'map-pin-5-line',
    'map-pin-add-line',
    'map-pin-range-line',
    'map-pin-time-line',
    'map-pin-user-line',
    'pushpin-line',
    'pushpin-2-line',
    'road-map-line',
    'compass-line',
    'compass-2-line',
    'compass-3-line',
    'compass-4-line',
    'compass-discover-line',
    'direction-line',
    'navigation-line',
    'guide-line',
    'map-line',
    'map-2-line',
    'treasure-map-line',
    'route-line',
    'gps-line',
    'parking-line',
    'parking-box-line',
    'car-line',
    'car-washing-line',
    'caravan-line',
    'bus-line',
    'bus-2-line',
    'bus-wifi-line',
    'train-line',
    'train-wifi-line',
    'subway-line',
    'subway-wifi-line',
    'taxi-line',
    'taxi-wifi-line',
    'plane-line',
    'flight-land-line',
    'flight-takeoff-line',
    'rocket-line',
    'rocket-2-line',
    'ship-line',
    'ship-2-line',
    'sailboat-line',
    'bike-line',
    'e-bike-line',
    'e-bike-2-line',
    'motorbike-line',
    'truck-line',
    'walk-line',
    'run-line',
    'riding-line',
    'barricade-line',
    'footprint-line',
    'traffic-light-line',
    'signal-tower-line',
    'china-railway-line',
    'space-ship-line',
    'steering-line',
    'steering-2-line',
    'takeaway-line',
    'luggage-cart-line',
    'luggage-deposit-line',
    'suitcase-line',
    'suitcase-2-line',
    'suitcase-3-line',
    'roadster-line',
    'police-car-line',
  ],
  Time: [
    'time-line',
    'timer-line',
    'timer-2-line',
    'timer-flash-line',
    'alarm-line',
    'alarm-warning-line',
    'calendar-line',
    'calendar-2-line',
    'calendar-check-line',
    'calendar-close-line',
    'calendar-event-line',
    'calendar-todo-line',
    '24-hours-line',
    'history-line',
    'hourglass-line',
    'hourglass-2-line',
  ],
  Status: [
    'information-line',
    'information-2-line',
    'question-line',
    'question-mark',
    'error-warning-line',
    'alert-line',
    'alarm-warning-line',
    'spam-line',
    'spam-2-line',
    'spam-3-line',
    'checkbox-circle-line',
    'checkbox-blank-circle-line',
    'indeterminate-circle-line',
    'add-circle-line',
    'close-circle-line',
    'check-line',
    'check-double-line',
    'close-line',
    'add-line',
    'subtract-line',
    'divide-line',
    'thumb-up-line',
    'thumb-down-line',
    'star-line',
    'star-half-line',
    'star-half-s-line',
    'star-s-line',
    'heart-line',
    'heart-2-line',
    'heart-3-line',
    'heart-add-line',
    'heart-pulse-line',
    'hearts-line',
    'dislike-line',
    'shield-line',
    'shield-check-line',
    'shield-cross-line',
    'shield-flash-line',
    'shield-keyhole-line',
    'shield-star-line',
    'shield-user-line',
    'verified-badge-line',
    'medal-line',
    'medal-2-line',
    'award-line',
    'trophy-line',
    'flag-line',
    'flag-2-line',
    'bookmark-line',
    'bookmark-2-line',
    'bookmark-3-line',
    'fire-line',
    'lightbulb-line',
    'lightbulb-flash-line',
    'flashlight-line',
    'moon-line',
    'moon-clear-line',
    'moon-cloudy-line',
    'moon-foggy-line',
    'sun-line',
    'sun-cloudy-line',
    'sun-foggy-line',
    'sparkling-line',
    'sparkling-2-line',
    'rainbow-line',
    'star-smile-line',
    'magic-line',
    'cake-line',
    'cake-2-line',
    'cake-3-line',
    'vip-line',
    'vip-crown-line',
    'vip-crown-2-line',
    'vip-diamond-line',
    'key-line',
    'key-2-line',
    'lock-line',
    'lock-2-line',
  ],
};

const SimpleIconPicker = (props) => {
  const { id, value, onChange } = props;

  return (
    <FormFieldWrapper
      {...props}
      draggable={false}
      className="simple-icon-picker-widget"
    >
      <SimpleIconPickerCore id={id} value={value} onChange={onChange} />
    </FormFieldWrapper>
  );
};

const SimpleIconPickerCore = ({ id, value, onChange }) => {
  const [showPicker, setShowPicker] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('Arrows');

  // Get last 10 used icons from localStorage
  const getLastUsedIcons = () => {
    try {
      const saved = localStorage.getItem('volto-icon-picker-last-used');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.warn('Could not load last used icons from localStorage:', e);
      return [];
    }
  };

  // Save icon to last used icons
  const saveToLastUsed = (icon) => {
    try {
      const lastUsed = getLastUsedIcons();
      const filtered = lastUsed.filter((i) => i !== icon);
      const newLastUsed = [icon, ...filtered].slice(0, 10);
      localStorage.setItem(
        'volto-icon-picker-last-used',
        JSON.stringify(newLastUsed),
      );
      return newLastUsed;
    } catch (e) {
      console.warn('Could not save to last used icons:', e);
      return [];
    }
  };

  const [lastUsedIcons, setLastUsedIcons] = React.useState(getLastUsedIcons);

  // Load last used icons when component mounts
  React.useEffect(() => {
    const lastUsed = getLastUsedIcons();
    setLastUsedIcons(lastUsed);
  }, []);

  // Debounce search term
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Filter and rank icons based on search term
  const filteredIcons = React.useMemo(() => {
    if (!debouncedSearchTerm) {
      return iconCategories[selectedCategory] || [];
    }

    const allIcons = Object.values(iconCategories).flat();
    const searchLower = debouncedSearchTerm.toLowerCase();

    const iconMatches = allIcons
      .map((icon) => {
        const iconLower = icon.toLowerCase();
        const cleanIcon = icon.replace('ri-', '').replace('-line', '');
        const cleanIconLower = cleanIcon.toLowerCase();

        let score = 0;

        // Exact match gets highest priority
        if (cleanIconLower === searchLower) {
          score = 1000;
        }
        // Starts with search term gets high priority
        else if (cleanIconLower.startsWith(searchLower)) {
          score = 900;
        }
        // Icon name starts with search term (including prefixes)
        else if (iconLower.startsWith(searchLower)) {
          score = 800;
        }
        // Clean name contains search term at word boundary
        else if (
          cleanIconLower.includes('-' + searchLower) ||
          cleanIconLower.includes('_' + searchLower)
        ) {
          score = 700;
        }
        // Contains search term
        else if (iconLower.includes(searchLower)) {
          score = 500;
        }
        // No match
        else {
          return null;
        }

        // Bonus points for shorter names (more specific)
        score += Math.max(0, 50 - cleanIcon.length);

        // Bonus points for exact word matches
        const words = cleanIconLower.split(/[-_]/);
        if (words.includes(searchLower)) {
          score += 200;
        }

        return { icon, score };
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.icon);

    return iconMatches;
  }, [debouncedSearchTerm, selectedCategory]);

  const handleIconSelect = (icon) => {
    onChange(id, icon);
    const newLastUsed = saveToLastUsed(icon);
    setLastUsedIcons(newLastUsed);
    setShowPicker(false);
  };

  const handleCloseModal = (e) => {
    if (e) e.preventDefault();
    setShowPicker(false);
    setSearchTerm('');
    setDebouncedSearchTerm('');
  };

  // Get the icon class for display
  const getIconClass = (iconName) => {
    if (!iconName) return '';
    return iconName.startsWith('ri-') ? iconName : `ri-${iconName}`;
  };

  return (
    <div className="wrapper">
      <div
        onClick={(e) => {
          setShowPicker(!showPicker);
          e.preventDefault();
        }}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '48px',
          background: value
            ? 'linear-gradient(135deg, #eff8ff 0%, #dbeafe 100%)'
            : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          border: value ? '2px solid #094ce1' : '2px solid #e5e7eb',
          borderRadius: '10px',
          cursor: 'pointer',
          transition: 'all 0.3s ease',

          position: 'relative',
        }}
        title="Choose icon"
        onMouseEnter={(e) => {
          e.target.style.transform = 'translateY(-1px)';
          e.target.style.boxShadow = value
            ? '0 8px 25px rgba(9, 76, 225, 0.25)'
            : '0 4px 12px rgba(0, 0, 0, 0.1)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = value
            ? '0 4px 12px rgba(9, 76, 225, 0.15)'
            : '0 2px 4px rgba(0, 0, 0, 0.05)';
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <i
            className={value ? getIconClass(value) : 'ri-add-circle-line'}
            style={{
              fontSize: '24px',
              color: value ? '#094ce1' : '#9ca3af',
            }}
          />
          <span
            style={{
              fontSize: '10px',
              color: value ? '#094ce1' : '#6b7280',
              fontWeight: '500',
              textAlign: 'center',
              lineHeight: '1.3',
            }}
          >
            {value
              ? value.replace('ri-', '').replace('-line', '')
              : 'Choose Icon'}
          </span>
        </div>
        <i
          className="ri-arrow-down-s-line"
          style={{
            position: 'absolute',
            right: '12px',
            fontSize: '16px',
            color: '#9ca3af',
          }}
        />
      </div>

      <Modal
        open={showPicker}
        onClose={handleCloseModal}
        size="large"
        closeIcon
        style={{
          position: 'fixed',
          right: '20px',
          top: '20px',
          left: 'auto',
          transform: 'none',
          margin: '0',
          width: '650px',
          height: 'calc(100vh - 40px)',
          maxHeight: 'calc(100vh - 40px)',
          overflow: 'hidden',
          borderRadius: '12px',
          border: 'none',
          boxShadow:
            '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)',
        }}
      >
        <Header
          style={{
            background: 'linear-gradient(135deg, #094ce1 0%, #0c3db7 100%)',
            color: 'white',
            borderRadius: '12px 12px 0 0',
            padding: '20px 24px',
            border: 'none',
            fontSize: '18px',
            fontWeight: '600',
          }}
        >
          <i className="ri-palette-line" style={{ marginRight: '10px' }} />
          Choose Icon
        </Header>
        <Modal.Content
          style={{
            height: 'calc(100vh - 160px)',
            overflowY: 'auto',
            padding: '24px',
            background: '#fafbfc',
          }}
        >
          <div>
            <div style={{ marginBottom: '24px' }}>
              <Input
                fluid
                icon="search"
                placeholder="Search icons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  borderRadius: '10px',
                  border: '2px solid #e1e8f0',
                  fontSize: '14px',
                  transition: 'all 0.3s ease',
                }}
              />
            </div>

            {lastUsedIcons.length > 0 && !debouncedSearchTerm && (
              <>
                <div
                  style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <i
                    className="ri-history-line"
                    style={{ marginRight: '8px', color: '#094ce1' }}
                  />
                  Recently Used
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(65px, 1fr))',
                    gap: '12px',
                    marginBottom: '32px',
                    padding: '20px',
                    background:
                      'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  {lastUsedIcons.map((icon, index) => (
                    <div
                      key={`recent-${icon}`}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        padding: '14px 10px',
                        border: value === icon ? '2px solid #094ce1' : 'none',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        backgroundColor: value === icon ? '#f0f9ff' : '#ffffff',
                        boxShadow:
                          value === icon
                            ? '0 10px 25px -3px rgba(99, 102, 241, 0.2), 0 4px 6px -2px rgba(99, 102, 241, 0.05)'
                            : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        transform:
                          value === icon ? 'translateY(-2px)' : 'translateY(0)',
                      }}
                      onClick={() => handleIconSelect(icon)}
                      title={icon}
                      onMouseEnter={(e) => {
                        if (value !== icon) {
                          e.target.style.backgroundColor = '#f8fafc';
                          e.target.style.transform = 'translateY(-1px)';
                          e.target.style.boxShadow =
                            '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (value !== icon) {
                          e.target.style.backgroundColor = '#ffffff';
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow =
                            '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                        }
                      }}
                    >
                      <i
                        className={getIconClass(icon)}
                        style={{
                          fontSize: '22px',
                          marginBottom: '6px',
                          color: value === icon ? '#094ce1' : '#4b5563',
                        }}
                      />
                      <span
                        style={{
                          fontSize: '10px',
                          textAlign: 'center',
                          color: value === icon ? '#094ce1' : '#6b7280',
                          wordBreak: 'break-all',
                          lineHeight: '1.3',
                          fontWeight: '500',
                        }}
                      >
                        {icon.replace('ri-', '').replace('-line', '')}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {!debouncedSearchTerm && (
              <>
                <div
                  style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <i
                    className="ri-grid-line"
                    style={{ marginRight: '8px', color: '#094ce1' }}
                  />
                  Categories
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '10px',
                    marginBottom: '32px',
                  }}
                >
                  {Object.keys(iconCategories).map((category) => (
                    <div
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '20px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '500',
                        transition: 'all 0.3s ease',
                        background:
                          selectedCategory === category
                            ? 'linear-gradient(135deg, #094ce1 0%, #ffbf40 100%)'
                            : '#ffffff',
                        color:
                          selectedCategory === category ? '#ffffff' : '#6b7280',
                        border:
                          selectedCategory === category
                            ? 'none'
                            : '2px solid #e5e7eb',
                        boxShadow:
                          selectedCategory === category
                            ? '0 10px 25px -3px rgba(99, 102, 241, 0.3)'
                            : '0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                        transform:
                          selectedCategory === category
                            ? 'translateY(-1px)'
                            : 'translateY(0)',
                      }}
                      onMouseEnter={(e) => {
                        if (selectedCategory !== category) {
                          e.target.style.backgroundColor = '#f9fafb';
                          e.target.style.borderColor = '#d1d5db';
                          e.target.style.transform = 'translateY(-1px)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedCategory !== category) {
                          e.target.style.backgroundColor = '#ffffff';
                          e.target.style.borderColor = '#e5e7eb';
                          e.target.style.transform = 'translateY(0)';
                        }
                      }}
                    >
                      {category}
                    </div>
                  ))}
                </div>
              </>
            )}

            <div
              style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <i
                className={
                  debouncedSearchTerm ? 'ri-search-line' : 'ri-apps-line'
                }
                style={{ marginRight: '8px', color: '#094ce1' }}
              />
              {debouncedSearchTerm
                ? `Search Results (${filteredIcons.length})`
                : selectedCategory}
            </div>
            <div
              key={`icons-grid-${debouncedSearchTerm}-${selectedCategory}`}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(75px, 1fr))',
                gap: '12px',
                maxHeight: '400px',
                overflowY: 'auto',
                background: '#ffffff',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid #e5e7eb',
                boxShadow:
                  '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
              }}
            >
              {filteredIcons.map((icon) => (
                <div
                  key={icon}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '14px 10px',
                    border: value === icon ? '2px solid #094ce1' : 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    backgroundColor: value === icon ? '#f0f9ff' : '#f9fafb',
                    boxShadow:
                      value === icon
                        ? '0 10px 25px -3px rgba(99, 102, 241, 0.2), 0 4px 6px -2px rgba(99, 102, 241, 0.05)'
                        : '0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform:
                      value === icon ? 'translateY(-2px)' : 'translateY(0)',
                  }}
                  onClick={() => handleIconSelect(icon)}
                  title={icon}
                  onMouseEnter={(e) => {
                    if (value !== icon) {
                      e.target.style.backgroundColor = '#ffffff';
                      e.target.style.transform = 'translateY(-1px)';
                      e.target.style.boxShadow =
                        '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (value !== icon) {
                      e.target.style.backgroundColor = '#f9fafb';
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow =
                        '0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                    }
                  }}
                >
                  <i
                    className={getIconClass(icon)}
                    style={{
                      fontSize: '22px',
                      marginBottom: '6px',
                      color: value === icon ? '#094ce1' : '#4b5563',
                    }}
                  />
                  <span
                    style={{
                      fontSize: '10px',
                      textAlign: 'center',
                      color: value === icon ? '#094ce1' : '#6b7280',
                      wordBreak: 'break-all',
                      lineHeight: '1.3',
                      fontWeight: '500',
                    }}
                  >
                    {icon.replace('ri-', '').replace('-line', '')}
                  </span>
                </div>
              ))}
            </div>

            {filteredIcons.length === 0 && debouncedSearchTerm && (
              <div
                style={{
                  textAlign: 'center',
                  padding: '60px 20px',
                  color: '#9ca3af',
                  fontSize: '16px',
                  fontWeight: '500',
                  background:
                    'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
                  borderRadius: '12px',
                  border: '2px dashed #d1d5db',
                  margin: '20px 0',
                }}
              >
                <i
                  className="ri-search-line"
                  style={{
                    fontSize: '48px',
                    display: 'block',
                    marginBottom: '16px',
                    color: '#d1d5db',
                  }}
                />
                No icons found matching "{debouncedSearchTerm}"
                <div
                  style={{
                    fontSize: '14px',
                    marginTop: '8px',
                    color: '#6b7280',
                  }}
                >
                  Try searching for different keywords
                </div>
              </div>
            )}

            <div
              style={{
                marginTop: '24px',
                display: 'flex',
                gap: '12px',
                borderTop: '1px solid #e5e7eb',
                paddingTop: '20px',
              }}
            >
              <div
                onClick={() => {
                  onChange(id, '');
                  setShowPicker(false);
                }}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  background:
                    'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: 'white',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  fontWeight: '600',
                  fontSize: '14px',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                  transition: 'all 0.3s ease',
                  border: 'none',
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow =
                    '0 8px 25px rgba(239, 68, 68, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow =
                    '0 4px 12px rgba(239, 68, 68, 0.3)';
                }}
              >
                Clear Selection
              </div>
              <div
                onClick={handleCloseModal}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  background:
                    'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                  color: 'white',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  fontWeight: '600',
                  fontSize: '14px',
                  boxShadow: '0 4px 12px rgba(107, 114, 128, 0.3)',
                  transition: 'all 0.3s ease',
                  border: 'none',
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow =
                    '0 8px 25px rgba(107, 114, 128, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow =
                    '0 4px 12px rgba(107, 114, 128, 0.3)';
                }}
              >
                Close
              </div>
            </div>
          </div>
        </Modal.Content>
      </Modal>
    </div>
  );
};

export default SimpleIconPicker;
export { SimpleIconPickerCore };
