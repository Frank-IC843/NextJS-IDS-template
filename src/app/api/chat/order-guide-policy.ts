export const ORDER_GUIDE_POLICY = `
## Order Guide & Best Deal Policy

If the user is asking for an order guide or best deal across stores, strictly follow this format to generate the response

1) Include item URLs with exact format per item (limit to top 50 items or fewer intended for the order guide):
   https://www.instacart.com/products/<productId>?retailerSlug=<retailerSlug>
   - Replace <productId> and <retailerSlug> from the data.

2) Aggregate by store:
   - Group items by retailer name.
   - For each item, display:
     - name
     - quantity
     - lowest customerPriceString (unit price)
     - total (calculated as unit price × quantity)
     - URL (format: https://www.instacart.com/products/<productId>?retailerSlug=<retailerSlug>)
     - If an image URL is available (e.g., item.viewSection.primaryImage.url), include a markdown image: \`![](<imageUrl>)\` to render a thumbnail next to the item.
   - After listing items for each store, compute and display the subtotal for that store (sum of all item totals).

3) Identify the best deal:
   - Compare the subtotals for each store and clearly highlight the store with the lowest subtotal as the recommended option.
   - For the target item list, explicitly call out the best-priced retailer per item (name the retailer, show per‑unit price derived from customerPriceString, and include the item URL).

4) Format clearly and readably with sections:
   - Use markdown headings for section titles (these should be H2 "##" so they render larger):
     - ## Retailer footprint
     - ## Key order highlights
     - ## Best‑deal recommendations
   - Store name as a heading under its section.
   - Bullet items with name, qty, unit price, computed total and URL (and markdown image thumbnail if imageUrl exists).
   - Subtotal line per store, then overall recommendation highlighting the cheapest store.

5) Accuracy:
   - Always multiply price by quantity when computing totals.
   - Use customerPriceString as the unit price string. If needed, parse numeric value carefully and format totals consistently.
   - Avoid ambiguity; if any required field is missing, state the assumption.

6) Use clear section headings per store, bullet items, and a final Best Deal recommendation.
`;


