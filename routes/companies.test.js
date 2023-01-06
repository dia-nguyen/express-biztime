"use strict";

const db = require("../db");
const request = require("supertest");
const app = require("../app");

let amazonTestCompany;

beforeEach(async function () {
  await db.query("DELETE FROM companies");
  let result = await db.query(`
  INSERT INTO companies (code,name,description)
  VALUES ('amazon', 'Amazon', 'Shipper of things')
  RETURNING code, name, description`);
  amazonTestCompany = result.rows[0];
});

/* GET /companies - returns `{companies: [amazon, ...]}` */
describe("GET /companies", function () {
  test("Gets a list of 2 companies", async () => {
    const resp = await request(app).get("/companies");

    delete amazonTestCompany.description;

    expect(resp.body).toEqual({
      companies: [amazonTestCompany],
    });
  });
});

/**POST /companies - returns  {company: {code, name, description}}*/
describe("POST /companies", function () {
  test("Adds a company", async () => {
    let newCompany = {
      name: "microsoft",
      code: "microsoft",
      description: "it's alright",
    };

    const resp = await request(app)
      .post("/companies")
      .send(newCompany);

    expect(resp.statusCode).toEqual(201);

    expect(resp.body).toEqual({
      company:  newCompany,
    });
  });
});
