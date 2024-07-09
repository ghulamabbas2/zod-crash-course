import { z } from "zod";

const extractErrors = (errors: z.ZodError) => {
  let errorObj = {};
  errors?.issues.forEach((issue) => {
    errorObj = { ...errorObj, [issue.path[0]]: issue.message };
  });

  return errorObj;
};

const Product = z.object({
  id: z.string({ message: "Please enter a string" }).uuid(),
  name: z.string({ message: "Please enter a string" }).default("Product name"),
  description: z.string({
    required_error: "Product enter product description",
    invalid_type_error: "Product description must be a string",
  }),
  price: z
    .number()
    .positive({ message: "Price must be greater than 0" })
    .min(1),
  image: z.string().url(),
  categories: z.array(z.string()),
});

type ProductType = z.infer<typeof Product>;

const productResponse = Product.safeParse({
  id: "123e4567-e89b-12d3-a456-426614174000",
  name: "Laptop",
  description: "This is a laptop",
  price: 10,
  image: "https://www.google.com",
  categories: ["Laptop"],
});

if (!productResponse.success) {
  console.log(extractErrors(productResponse.error));
}

// console.log(productResponse);

const Customer = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string().regex(/^\(\d{3}\) \d{3}-\d{4}$/, "Invalid phone number"),
});

// (123) 456-7890

const customerResponse = Customer.safeParse({
  id: "123e4567-e89b-12d3-a456-426614174000",
  name: "John Doe",
  email: "hello@johndoe.com",
  phone: "(123) 456-7899",
});

if (!customerResponse.success) {
  console.log(extractErrors(customerResponse.error));
}

// console.log(customerResponse);

const OrderItem = z
  .object({
    productId: z.string().uuid(),
    quantity: z.number().int().positive(),
  })
  .extend({
    total: z.number().positive(),
  });
//   .required();
//   .partial();
//   .strict();
//   .omit({ quantity: true, total: true });
//   .pick({ productId: true });

const orderItemResponse = OrderItem.safeParse({
  productId: "123e4567-e89b-12d3-a456-426614174000",
  quantity: 10,
  total: 12,
});

if (!orderItemResponse.success) {
  console.log(extractErrors(orderItemResponse.error));
}

const orderItemSchema = OrderItem.keyof();

// console.log(orderItemSchema.Enum);

const Order = z
  .object({
    id: z.string().uuid(),
    customerId: z.string().uuid(),
    items: z.array(OrderItem),
    status: z.enum(["pending", "completed", "cancelled"]),
  })
  .transform((order) => {
    const customer = {
      id: order.customerId,
      name: "John Doe",
      email: "test@exmaple.com",
    };

    return {
      ...order,
      customer,
      totalAmount: order.items.reduce((acc, item) => acc + item.total, 0),
    };
  });

const orderResponse = Order.safeParse({
  id: "123e4567-e89b-12d3-a456-426614174000",
  customerId: "123e4567-e89b-12d3-a456-426614174000",
  items: [
    {
      productId: "123e4567-e89b-12d3-a456-426614174000",
      quantity: 10,
      total: 12,
    },
    {
      productId: "123e4567-e89b-12d3-a456-426614174000",
      quantity: 10,
      total: 122,
    },
  ],
  status: "pending",
});

if (!orderResponse.success) {
  console.log(extractErrors(orderResponse.error));
}

// console.log(orderResponse);

const TestSchema = z.object({
  union: z.union([z.string(), z.number(), z.boolean()]),
  intersection: z.intersection(
    z.object({ name: z.string() }),
    z.object({ age: z.number() })
  ),
  coordinates: z.tuple([z.number(), z.number()]),
  map: z.map(z.string(), z.number()),
  promise: z.promise(z.string()),
  function: z.function().args(z.string()).returns(z.number()),
  literal: z.literal("hello"),
  instanceof: z.instanceof(Date),
  object: z.object({
    nested: z.object({
      field: z.string(),
    }),
  }),
  custom: z.string().refine((value) => value.startsWith("custom"), {
    message: "Value must start with custom",
  }),
  or: z.string().or(z.number()),
  and: z.object({ name: z.string() }).and(z.object({ age: z.number() })),
});

const testResponse = TestSchema.safeParse({
  union: false,
  intersection: { name: "hello", age: 10 },
  coordinates: [10, 20],
  map: new Map([["hello", 10]]),
  promise: Promise.resolve("hello"),
  function: (name: string) => 10,
  literal: "hello",
  instanceof: new Date(),
  object: { nested: { field: "hello" } },
  custom: "custom value",
  or: "10",
  and: { name: "hello", age: 10 },
});

if (!testResponse.success) {
  console.log(extractErrors(testResponse.error));
}

// console.log(testResponse);

const numberWithCatch = z.string().catch("Error");

// console.log(numberWithCatch.safeParse(false));

const AgeSchema = z.preprocess((value) => Number(value), z.number().min(0));

// console.log(AgeSchema.safeParse("10"));
// console.log(AgeSchema.safeParse("twenty-five"));
// console.log(AgeSchema.safeParse("-5"));
