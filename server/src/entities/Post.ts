import { Entity, Property, PrimaryKey } from "@mikro-orm/core";
import { Field, ObjectType } from "type-graphql";

@ObjectType() // Turn class into graphQL type
@Entity() // ctrl + .
export class Post {
  @Field() // type-graphQL exposing to graphQL schema
  @PrimaryKey()
  id!: number;

  @Field(() => String) // type-graphQL
  @Property({ type: "date" }) // mikro-orm
  createdAt = new Date();

  @Field(() => String) // type-graphQL
  @Property({ type: "date", onUpdate: () => new Date() })
  updatedAt = new Date();

  @Field() // type-graphQL
  @Property({ type: "text" })
  title!: String;
}
