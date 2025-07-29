import ConfigRegistry from '@plone/volto/registry';
import { parse as parseUrl } from 'url';
import { nonContentRoutes } from '@plone/volto/config/NonContentRoutes';
import { nonContentRoutesPublic } from '@plone/volto/config/NonContentRoutesPublic';
import { loadables } from '@plone/volto/config/Loadables';
import { workflowMapping } from '@plone/volto/config/Workflows';
import slots from '@plone/volto/config/slots';

import { contentIcons } from '@plone/volto/config/ContentIcons';
import { styleClassNameConverters, styleClassNameExtenders } from '@plone/volto/config/Style';
import {
  controlPanelsIcons,
  filterControlPanels,
  filterControlPanelsSchema,
  unwantedControlPanelsFields,
} from '@plone/volto/config/ControlPanels';

import applyAddonConfiguration, { addonsInfo } from 'load-volto-addons';

import { installDefaultComponents } from '@plone/volto/config/Components';
import { installDefaultWidgets } from '@plone/volto/config/Widgets';
import { installDefaultViews } from '@plone/volto/config/Views';
import { installDefaultBlocks } from '@plone/volto/config/Blocks';

import { getSiteAsyncPropExtender } from '@plone/volto/helpers/Site';
import { registerValidators } from '@plone/volto/config/validation';

const host = process.env.HOST || 'localhost';
const port = process.env.PORT || '3000';

const apiPath =
  process.env.RAZZLE_API_PATH ||
  (__DEVELOPMENT__ ? `http://${host}:${port}` : '');

// Fixed getServerURL function to handle null ports correctly
const getServerURL = (url) => {
  if (!url) return;
  const apiPathURL = parseUrl(url);
  return `${apiPathURL.protocol}//${apiPathURL.hostname}${
    apiPathURL.port && apiPathURL.port !== 'null' && apiPathURL.port > 0 ? `:${apiPathURL.port}` : ''
  }`;
};

// Sensible defaults for publicURL
// if RAZZLE_PUBLIC_URL is present, use it
// if in DEV, use the host/port combination by default
// if in PROD, assume it's RAZZLE_API_PATH server name (no /api or alikes) or fallback
// to DEV settings if RAZZLE_API_PATH is not present
const publicURL =
  process.env.RAZZLE_PUBLIC_URL ||
  (__DEVELOPMENT__
    ? `http://${host}:${port}`
    : getServerURL(process.env.RAZZLE_API_PATH) || `http://${host}:${port}`);

const serverConfig =
  typeof __SERVER__ !== 'undefined' && __SERVER__
    ? require('@plone/volto/config/server').default
    : {};

let config = {
  settings: {
    host,
    port,
    // The URL Volto is going to be served (see sensible defaults above)
    publicURL,
    okRoute: '/ok',
    apiPath,
    apiExpanders: [
      // Added here for documentation purposes, added at the end because it
      // depends on a value of this object.
      // Add the following expanders for only issuing a single request.
      // https://6.docs.plone.org/volto/configuration/settings-reference.html#term-apiExpanders
      // {
      //   match: '',
      //   GET_CONTENT: [
      //     'breadcrumbs',
      //     'navigation',
      //     'actions',
      //     'types',
      //     'navroot',
      //   ],
      // },
    ],
    // Internal proxy to bypass CORS *while developing*. NOT intended for production use.
    // In production is recommended you use a Seamless mode deployment using a web server in
    // front of both the frontend and the backend so you can bypass CORS safely.
    // https://6.docs.plone.org/volto/deploying/seamless-mode.html
    devProxyToApiPath:
      process.env.RAZZLE_DEV_PROXY_API_PATH ||
      process.env.RAZZLE_INTERNAL_API_PATH ||
      process.env.RAZZLE_API_PATH ||
      'http://localhost:8080/Plone', // Set it to '' for disabling the proxy
    // proxyRewriteTarget Set it for set a custom target for the proxy or override the internal VHM rewrite
    // proxyRewriteTarget: '/VirtualHostBase/http/localhost:8080/Plone/VirtualHostRoot/_vh_api'
    // proxyRewriteTarget: 'https://myvoltositeinproduction.com'
    proxyRewriteTarget: process.env.RAZZLE_PROXY_REWRITE_TARGET || undefined,
    // apiPath: process.env.RAZZLE_API_PATH || 'http://localhost:8000', // for Volto reference
    // apiPath: process.env.RAZZLE_API_PATH || 'http://localhost:8081/db/web', // for guillotina
    actions_raising_api_errors: ['GET_CONTENT', 'UPDATE_CONTENT'],
    internalApiPath: process.env.RAZZLE_INTERNAL_API_PATH || undefined,
    websockets: process.env.RAZZLE_WEBSOCKETS || false,
    // TODO: legacyTraverse to be removed when the use of the legacy traverse is deprecated.
    legacyTraverse: process.env.RAZZLE_LEGACY_TRAVERSE || false,
    cookieExpires: 15552000, //in seconds. Default is 6 month (15552000)
    nonContentRoutes,
    nonContentRoutesPublic,
    imageObjects: ['Image'],
    reservedIds: ['login', 'layout', 'plone', 'zip', 'properties'],
    downloadableObjects: ['File'], //list of content-types for which the direct download of the file will be carried out if the user is not authenticated
    viewableInBrowserObjects: [], //ex: ['File']. List of content-types for which the file will be displayed in browser if the user is not authenticated
    listingPreviewImageField: 'image', // deprecated from Volto 14 onwards
    openExternalLinkInNewTab: false,
    notSupportedBrowsers: ['ie'],
    defaultPageSize: 25,
    isMultilingual: false,
    supportedLanguages: ['en'],
    defaultLanguage: process.env.SITE_DEFAULT_LANGUAGE || 'en',
    navDepth: 1,
    expressMiddleware: serverConfig.expressMiddleware, // BBB
    defaultBlockType: 'slate',
    verticalFormTabs: false,
    useEmailAsLogin: false,
    persistentReducers: ['blocksClipboard'],
    initialReducersBlacklist: [], // reducers in this list won't be hydrated in windows.__data
    asyncPropsExtenders: [getSiteAsyncPropExtender], // per route asyncConnect customizers
    contentIcons: contentIcons,
    loadables,
    lazyBundles: {
      cms: [
        'prettierStandalone',
        'prettierParserHtml',
        'prismCore',
        'toastify',
        'reactSelect',
        'reactBeautifulDnd',
        // 'diffLib',
      ],
    },
    appExtras: [],
    maxResponseSize: 2000000000, // This is superagent default (200 mb)
    maxFileUploadSize: null,
    serverConfig,
    storeExtenders: [],
    showTags: true,
    showRelatedItems: false,
    controlpanels: [],
    controlPanelsIcons,
    filterControlPanels,
    filterControlPanelsSchema,
    unwantedControlPanelsFields,
    externalRoutes: [
      // { match: { path: '/news' } },
      // { match: { path: '/events' } },
      // Example: { match: { path: '/manage/mycustomroute/' } }
    ],
    contentMetadataTagsImageField: 'image',
    hashNavbar: process.env.RAZZLE_HASH_NAVBAR || false,
    navRoot: process.env.RAZZLE_NAVROOT || '/',
    logo: '/logo.png',
    defaultAddonName: '',
    sentryOptions: {},
    // Set this to true to enable seamless mode as documented in:
    // https://6.docs.plone.org/volto/deploying/seamless-mode.html
    useSeamlessMode: process.env.RAZZLE_SEAMLESS_MODE || false,
    // https://github.com/plone/volto/blob/main/news/2646.bugfix
    allowExternalVideoEmbeds: false,
    corsAllowOrigin: '*',
    // React errors catch
    // 3. "dev" -> Catchers defined in next option will be logged to console in DEV, but not in PROD
    // 2. "prod" -> Catchers defined in next option will be logged to console in both DEV and PROD
    // 1. "always" -> Catchers defined in next option will always be logged to console
    // 0. false -> Catchers defined in next option never be logged to console
    reactErrorCatcherOptions: false,
    reactErrorCatcherToConsole: [], // Catchers are: chunk, invariant, chunkExtended
    // Workspaces settings
    // Define your workspaces here, like:
    // workspaces: [
    //   {
    //     name: 'en',
    //     title: 'English',
    //     querystring: '/',
    //   },
    //   {
    //     name: 'de',
    //     title: 'Deutsch',
    //     querystring: '/',
    //   },
    // ],
    workspaces: [],
    blockSelectExtension: [],
    // Only to be used for testing purposes with a content-types that have blocks
    // behavior enabled by default in Plone (like Document).
    // This is because for Volto to work properly in that case, we need to put the
    // title and description also in the blocks, otherwise there's a mismatch.
    blocksDefaultFieldset: process.env.RAZZLE_BLOCKS_DEFAULT_FIELDSET || false,
    // This is a map of view names to block types
    // It supports more complex object format too
    // listingBlockTypes: ['customListing', 'listing', 'teaser'],
    listingBlockTypes: ['listing'],
    pageSize: process.env.RAZZLE_PAGE_SIZE || 25,
    defaultAllowedFiles: ['image', 'video', 'audio', 'text', 'application'],
    nonContentRoutesPublic,
    apiExpanders: [
      // {
      //   match: '',
      //   GET_CONTENT: [
      //     'breadcrumbs',
      //     'navigation',
      //     'actions',
      //     'types',
      //     'navroot',
      //   ],
      // },
    ],
    mfa: {},
    stylesClassNames: {},
    styleClassNameConverters,
    styleClassNameExtenders,
    // Configuration for the store persister
    persistentReducers: ['blocksClipboard'],
    workflowMapping,
    slots,
    queryStringSearchFilter: process.env.RAZZLE_QUERY_STRING_SEARCH_FILTER || false,
    contextNavigationEnabled: false,
    contextNavigationHide: [],
    contextNavigationRemoveWebsiteURL: false,
    contextNavigationRemoveTitle: false,
    contextNavigationSeparator: ' / ',
    contextNavigationPreferToken: false,
  },
  addonNames: addonsInfo.names,
  addonRoutes: addonsInfo.routes,
  addons: addonsInfo.addons,
  widgets: {
    ...installDefaultWidgets(config),
  },
  views: {
    ...installDefaultViews(config),
  },
  blocks: {
    ...installDefaultBlocks(config),
  },
  components: installDefaultComponents(config),
  // `blocks` property is deprecated, use `config.blocks` instead
  // The following are deprecated and will be removed in Volto 15
  // available_colors: [],
  // colormap: {
  //   'Volto Primary': '#007bb6',
  //   'Volto Accent': '#c7ced8',
  //   'Volto Secondary': '#006ba6',
  //   'Primary Default': '#007bb6',
  //   'Light Grey': '#cccccc',
  //   'Dark Grey': '#444444',
  // },
  // align: ['left', 'right', 'center', 'justify'],
  // size: ['s', 'm', 'l', 'xl'],
  // 'font-size': ['small', 'normal', 'large'],
  // 'text-align': ['left', 'center', 'right', 'justify'],
  // This is deprecated and will be removed in Volto 15
  // textEditorColors: [],
  experimental: {
    addBlockButton: {
      enabled: false,
    },
  },
};

registerValidators(config);

ConfigRegistry.settings = config.settings;
ConfigRegistry.addonNames = config.addonNames;
ConfigRegistry.addonRoutes = config.addonRoutes;
ConfigRegistry.blocks = config.blocks;
ConfigRegistry.views = config.views;
ConfigRegistry.widgets = config.widgets;
ConfigRegistry.components = config.components;
ConfigRegistry.addons = config.addons;
ConfigRegistry.experimental = config.experimental;

// Apply addon configuration
config = applyAddonConfiguration(config);

export default config;