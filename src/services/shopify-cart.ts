import { SHOPIFY_CONFIG } from '../data/productConfig';

interface CartCreateResponse {
  data: {
    cartCreate: {
      cart: { id: string; checkoutUrl: string } | null;
      userErrors: Array<{ field: string[]; message: string }>;
    };
  };
  errors?: Array<{ message: string }>;
}

interface ProductVariantsResponse {
  data: {
    product: {
      variants: {
        edges: Array<{
          node: {
            id: string;
            selectedOptions: Array<{ name: string; value: string }>;
          };
        }>;
      };
    } | null;
  };
}

let variantCache: Map<string, string> | null = null;

function getCacheKey(color: string, size: string, bundle: string): string {
  return `${color}|${size}|${bundle}`;
}

export async function fetchProductVariants(): Promise<Map<string, string>> {
  if (variantCache) return variantCache;

  const response = await fetch(
    `https://${SHOPIFY_CONFIG.store}/api/2024-01/graphql.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': SHOPIFY_CONFIG.storefrontToken,
      },
      body: JSON.stringify({
        query: `
          query getProductVariants($id: ID!) {
            product(id: $id) {
              variants(first: 250) {
                edges {
                  node {
                    id
                    selectedOptions { name value }
                  }
                }
              }
            }
          }
        `,
        variables: { id: SHOPIFY_CONFIG.productId },
      }),
    }
  );

  if (!response.ok) throw new Error(`Shopify API error: ${response.status}`);

  const result: ProductVariantsResponse = await response.json();
  const product = result.data.product;
  if (!product) throw new Error('Product not found');

  const cache = new Map<string, string>();
  for (const { node } of product.variants.edges) {
    const opts = node.selectedOptions.reduce((acc: Record<string, string>, o) => {
      const key = o.name.toLowerCase().replace(/[^a-z]/g, '');
      acc[key] = o.value;
      return acc;
    }, {});

    const key = getCacheKey(
      opts['color'] || '',
      opts['sizeus'] || opts['size'] || '',
      opts['bundle'] || ''
    );
    cache.set(key, node.id);
  }

  variantCache = cache;
  return cache;
}

export async function createShopifyCart(
  variantId: string,
  quantity: number = 1
): Promise<{ cartId: string; checkoutUrl: string }> {
  const response = await fetch(
    `https://${SHOPIFY_CONFIG.store}/api/2024-01/graphql.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': SHOPIFY_CONFIG.storefrontToken,
      },
      body: JSON.stringify({
        query: `
          mutation cartCreate($input: CartInput!) {
            cartCreate(input: $input) {
              cart { id checkoutUrl }
              userErrors { field message }
            }
          }
        `,
        variables: {
          input: { lines: [{ merchandiseId: variantId, quantity }] },
        },
      }),
    }
  );

  if (!response.ok) throw new Error(`Shopify API error: ${response.status}`);

  const result: CartCreateResponse = await response.json();
  if (result.errors?.length) throw new Error(result.errors[0].message);
  if (result.data.cartCreate.userErrors?.length) {
    throw new Error(result.data.cartCreate.userErrors[0].message);
  }

  const cart = result.data.cartCreate.cart;
  if (!cart) throw new Error('Failed to create cart');

  return { cartId: cart.id, checkoutUrl: cart.checkoutUrl };
}

function extractCartToken(cartId: string): string {
  return cartId.split('/').pop() || '';
}

function getPhoenixCheckoutUrl(cartToken: string): string {
  const url = new URL(SHOPIFY_CONFIG.phoenixCheckoutUrl);
  url.searchParams.set('store', 'kx107r-kj');
  url.searchParams.set('cart', cartToken);
  url.searchParams.set('trafficSource', SHOPIFY_CONFIG.trafficSource);
  return url.toString();
}

export async function createCartAndRedirect(
  color: string,
  size: string,
  bundle: string
): Promise<string> {
  const cache = await fetchProductVariants();
  const variantGid = cache.get(getCacheKey(color, size, bundle));

  if (!variantGid) {
    throw new Error(`Variant not found: ${color} / ${size} / ${bundle}`);
  }

  const { cartId } = await createShopifyCart(variantGid, 1);
  const cartToken = extractCartToken(cartId);
  return getPhoenixCheckoutUrl(cartToken);
}

export async function preloadVariantCache(): Promise<void> {
  try {
    await fetchProductVariants();
  } catch (e) {
    console.warn('Cache preload failed:', e);
  }
}
