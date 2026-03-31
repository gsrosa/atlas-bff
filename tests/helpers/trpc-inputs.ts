/** SuperJSON-encoded void input for tRPC GET (matches Postman / smoke scripts). */
export const voidInputEncoded = encodeURIComponent(
  '{"json":null,"meta":{"values":["undefined"],"v":1}}',
);

export const plansListInputEncoded = encodeURIComponent(JSON.stringify({ json: {}, meta: {} }));
