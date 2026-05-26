import { URL } from 'node:url';

const API_KEY = process.env.CERCALIA_API_KEY || '';
const BASE_URL = process.env.CERCALIA_BASE_URL || 'https://lb.cercalia.com/services/v2/json';

if (!API_KEY) {
  console.error('[cercalia-mcp] Missing CERCALIA_API_KEY environment variable.');
}

const TOOL_DEFS = [
  {
    name: 'check_api_key',
    description: 'Validate Cercalia API key with a lightweight geocoding request.',
    inputSchema: {
      type: 'object',
      properties: {
        base_url: { type: 'string', description: 'Optional base URL override.' }
      },
      additionalProperties: false
    }
  },
  {
    name: 'geocode',
    description: 'Geocode an address into coordinates using Cercalia Core REST API.',
    inputSchema: {
      type: 'object',
      properties: {
        street: { type: 'string' },
        locality: { type: 'string' },
        postal_code: { type: 'string' },
        country_code: { type: 'string', description: 'ISO alpha-3 recommended (e.g. ESP).' },
        raw_params: { type: 'object', description: 'Optional raw Cercalia query parameters override.' }
      },
      additionalProperties: true
    }
  },
  {
    name: 'reverse_geocode',
    description: 'Reverse geocode coordinates into an address using Cercalia Core REST API.',
    inputSchema: {
      type: 'object',
      properties: {
        lat: { type: 'number' },
        lng: { type: 'number' },
        mocs: { type: 'string', default: 'gdd' },
        raw_params: { type: 'object', description: 'Optional raw Cercalia query parameters override.' }
      },
      required: ['lat', 'lng'],
      additionalProperties: true
    }
  },
  {
    name: 'route',
    description: 'Calculate a route between origin and destination using Cercalia Core REST API.',
    inputSchema: {
      type: 'object',
      properties: {
        origin_lat: { type: 'number' },
        origin_lng: { type: 'number' },
        destination_lat: { type: 'number' },
        destination_lng: { type: 'number' },
        route_type: { type: 'string', description: 'Optional route type profile.' },
        raw_params: { type: 'object', description: 'Optional raw Cercalia query parameters override.' }
      },
      required: ['origin_lat', 'origin_lng', 'destination_lat', 'destination_lng'],
      additionalProperties: true
    }
  },
  {
    name: 'static_map',
    description: 'Generate a static map response from Cercalia Core REST API.',
    inputSchema: {
      type: 'object',
      properties: {
        city: { type: 'string', description: 'City/name parameter (ctn), per Static Maps docs example.' },
        country_code: { type: 'string', description: 'ISO alpha-3 (ctryc), e.g. ESP.' },
        width: { type: 'integer', default: 800 },
        height: { type: 'integer', default: 600 },
        extent: { type: 'string', description: 'Optional extent: Y,X upper-left|Y,X lower-right.' },
        mocs: { type: 'string', description: 'Coordinate system (e.g. gdd).' },
        marker: { type: 'string', description: 'Optional marker expression supported by the API.' },
        raw_params: { type: 'object', description: 'Optional raw Cercalia query parameters override.' }
      },
      required: [],
      additionalProperties: true
    }
  },
  {
    name: 'suggest',
    description: 'Autocomplete addresses and POIs with Cercalia Suggest API.',
    inputSchema: {
      type: 'object',
      properties: {
        text: { type: 'string' },
        locality: { type: 'string' },
        country_code: { type: 'string' },
        limit: { type: 'integer' },
        raw_params: { type: 'object', description: 'Optional raw Cercalia query parameters override.' }
      },
      required: ['text'],
      additionalProperties: true
    }
  },
  {
    name: 'isochrones',
    description: 'Calculate isochrones from a center point.',
    inputSchema: {
      type: 'object',
      properties: {
        lat: { type: 'number' },
        lng: { type: 'number' },
        isolevels: { type: 'string', description: 'Comma-separated thresholds, e.g. 120000,300000' },
        weight: { type: 'string', description: 'time or distance', default: 'time' },
        method: { type: 'string', description: 'convexhull or concavehull', default: 'concavehull' },
        raw_params: { type: 'object', description: 'Optional raw Cercalia query parameters override.' }
      },
      required: ['lat', 'lng', 'isolevels'],
      additionalProperties: true
    }
  },
  {
    name: 'poi_search',
    description: 'Search points of interest near a coordinate.',
    inputSchema: {
      type: 'object',
      properties: {
        lat: { type: 'number' },
        lng: { type: 'number' },
        radius: { type: 'integer', description: 'Radius in meters.' },
        categories: { type: 'string', description: 'POI category codes.' },
        text: { type: 'string', description: 'Optional text filter.' },
        raw_params: { type: 'object', description: 'Optional raw Cercalia query parameters override.' }
      },
      required: ['lat', 'lng'],
      additionalProperties: true
    }
  },
  {
    name: 'proximity_search',
    description: 'Run proximity search around a coordinate.',
    inputSchema: {
      type: 'object',
      properties: {
        lat: { type: 'number' },
        lng: { type: 'number' },
        radius: { type: 'integer', description: 'Radius in meters.' },
        categories: { type: 'string', description: 'POI category codes.' },
        raw_params: { type: 'object', description: 'Optional raw Cercalia query parameters override.' }
      },
      required: ['lat', 'lng'],
      additionalProperties: true
    }
  },
  {
    name: 'route_optimization',
    description: 'Submit raw route optimization query parameters. This endpoint may vary by Cercalia deployment.',
    inputSchema: {
      type: 'object',
      properties: {
        raw_params: {
          type: 'object',
          description: 'Raw query params for your route optimization endpoint. Must include the correct cmd/fields for your plan.'
        },
        cmd: { type: 'string', description: 'Optional cmd override if your deployment documents a specific optimization cmd.' }
      },
      required: ['raw_params'],
      additionalProperties: true
    }
  }
];

function send(message) {
  process.stdout.write(`${JSON.stringify(message)}\n`);
}

async function callCercalia(params, options = {}) {
  const url = new URL(options.baseUrl || BASE_URL);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') {
      url.searchParams.set(k, String(v));
    }
  });
  const requestApiKey = options.apiKey || API_KEY;
  url.searchParams.set('key', requestApiKey);

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: { Accept: 'application/json' }
  });

  const bodyText = await response.text();
  if (!response.ok) {
    const compactBody = bodyText.replace(/\s+/g, ' ').trim().slice(0, 400);
    const redacted = compactBody
      .replace(/key=[^&\s]+/gi, 'key=***')
      .replace(/api[_-]?key[^,\s:]*[:=]\s*[^,\s]+/gi, 'api_key=***');
    throw new Error(`Cercalia API error ${response.status}: ${redacted}`);
  }

  try {
    return JSON.parse(bodyText);
  } catch {
    return { raw: bodyText };
  }
}

function withRawParams(defaults, rawParams) {
  if (!rawParams || typeof rawParams !== 'object') {
    return defaults;
  }
  return { ...defaults, ...rawParams };
}

function requireApiKey(toolName) {
  if (!API_KEY) {
    throw new Error(`${toolName}: CERCALIA_API_KEY is not configured on the MCP server process.`);
  }
}

function requireNumber(value, name, toolName) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw new Error(`${toolName}: '${name}' must be a valid number.`);
  }
}

async function handleToolCall(name, args) {
  switch (name) {
    case 'geocode':
      requireApiKey(name);
      return callCercalia(withRawParams({
        cmd: 'geocoding',
        mocs: 'gdd',
        ocs: 'gdd',
        st: args.street,
        ct: args.locality,
        pcode: args.postal_code,
        ctryc: args.country_code
      }, args.raw_params));

    case 'reverse_geocode':
      requireApiKey(name);
      requireNumber(args.lat, 'lat', name);
      requireNumber(args.lng, 'lng', name);
      return callCercalia(withRawParams({
        cmd: 'inversegeocoding',
        mocs: args.mocs || 'gdd',
        mo: `${args.lat},${args.lng}`
      }, args.raw_params));

    case 'route':
      requireApiKey(name);
      requireNumber(args.origin_lat, 'origin_lat', name);
      requireNumber(args.origin_lng, 'origin_lng', name);
      requireNumber(args.destination_lat, 'destination_lat', name);
      requireNumber(args.destination_lng, 'destination_lng', name);
      return callCercalia(withRawParams({
        cmd: 'route',
        mocs: 'gdd',
        ocs: 'gdd',
        mo: `${args.origin_lat},${args.origin_lng}`,
        md: `${args.destination_lat},${args.destination_lng}`,
        rte: args.route_type
      }, args.raw_params));

    case 'static_map':
      requireApiKey(name);
      return callCercalia(withRawParams({
        cmd: 'map',
        mocs: args.mocs || 'gdd',
        ctn: args.city,
        ctryc: args.country_code,
        width: args.width ?? 800,
        height: args.height ?? 600,
        extent: args.extent,
        marker: args.marker
      }, args.raw_params));

    case 'suggest':
      requireApiKey(name);
      return callCercalia(withRawParams({
        cmd: 'suggest',
        q: args.text,
        ct: args.locality,
        ctryc: args.country_code,
        nres: args.limit
      }, args.raw_params));

    case 'isochrones':
      requireApiKey(name);
      requireNumber(args.lat, 'lat', name);
      requireNumber(args.lng, 'lng', name);
      return callCercalia(withRawParams({
        cmd: 'isochrone',
        mocs: '4326',
        ocs: '4326',
        mo: `${args.lng},${args.lat}`,
        isolevels: args.isolevels,
        weight: args.weight || 'time',
        method: args.method || 'concavehull'
      }, args.raw_params));

    case 'poi_search':
      requireApiKey(name);
      requireNumber(args.lat, 'lat', name);
      requireNumber(args.lng, 'lng', name);
      return callCercalia(withRawParams({
        cmd: 'prox',
        mocs: 'gdd',
        mo: `${args.lat},${args.lng}`,
        rad: args.radius,
        rqpoicats: args.categories,
        q: args.text
      }, args.raw_params));

    case 'proximity_search':
      requireApiKey(name);
      requireNumber(args.lat, 'lat', name);
      requireNumber(args.lng, 'lng', name);
      return callCercalia(withRawParams({
        cmd: 'prox',
        mocs: 'gdd',
        mo: `${args.lat},${args.lng}`,
        rad: args.radius,
        rqpoicats: args.categories
      }, args.raw_params));

    case 'route_optimization':
      requireApiKey(name);
      if (!args.cmd && (!args.raw_params || !args.raw_params.cmd)) {
        throw new Error('route_optimization requires cmd in args.cmd or raw_params.cmd as documented by your Cercalia deployment.');
      }
      return callCercalia(withRawParams({
        cmd: args.cmd
      }, args.raw_params));


    case 'check_api_key': {
      requireApiKey(name);
      const result = await callCercalia(
        {
          cmd: 'geocoding',
          mocs: 'gdd',
          ocs: 'gdd',
          st: 'Gran Via, 1',
          ct: 'Madrid',
          ctryc: 'ESP'
        },
        { apiKey: API_KEY, baseUrl: args.base_url }
      );
      return {
        ok: true,
        message: 'API key is valid.',
        base_url: args.base_url || BASE_URL,
        sample: result
      };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

function toToolResult(payload) {
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(payload, null, 2)
      }
    ]
  };
}

function onMessage(message) {
  const { id, method, params } = message;

  if (method === 'initialize') {
    send({
      jsonrpc: '2.0',
      id,
      result: {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        serverInfo: { name: 'cercalia-mcp', version: '0.2.0' }
      }
    });
    return;
  }

  if (method === 'notifications/initialized') return;

  if (method === 'tools/list') {
    send({ jsonrpc: '2.0', id, result: { tools: TOOL_DEFS } });
    return;
  }

  if (method === 'tools/call') {
    const toolName = params?.name;
    const args = params?.arguments || {};
    handleToolCall(toolName, args)
      .then((result) => {
        send({ jsonrpc: '2.0', id, result: toToolResult(result) });
      })
      .catch((error) => {
        send({
          jsonrpc: '2.0',
          id,
          error: {
            code: -32000,
            message: error.message
          }
        });
      });
    return;
  }

  send({
    jsonrpc: '2.0',
    id,
    error: {
      code: -32601,
      message: `Method not found: ${method}`
    }
  });
}

let buffer = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  buffer += chunk;
  let idx = buffer.indexOf('\n');
  while (idx !== -1) {
    const line = buffer.slice(0, idx).trim();
    buffer = buffer.slice(idx + 1);
    if (line) {
      try {
        const message = JSON.parse(line);
        onMessage(message);
      } catch (error) {
        send({
          jsonrpc: '2.0',
          error: {
            code: -32700,
            message: `Parse error: ${error.message}`
          }
        });
      }
    }
    idx = buffer.indexOf('\n');
  }
});
