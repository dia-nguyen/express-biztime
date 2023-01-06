'use strict'

const db = require("../db");
const request = require("supertest");
const app = require("../app");

let amazonTestCompany;

beforeEach( async function() {
  await db.query("DELETE FROM companies");
  let result = await db.query(`
  INSERT INTO companies (code,name,description)
  VALUES ('amazon', 'Amazon', 'Shipper of things')
  RETURNING code, name, description`)
  amazonTestCompany = result.rows[0];
});


/* GET /companies - returns `{companies: [amazon, ...]}` */
describe("GET /companies", function() {
  test("Gets a list of 2 companies", async () => {
    const resp = await request(app).get("/companies");

    expect(resp.body).toEqual({
      "companies": [
        {
          "code": "amazon",
          "name": "Amazon"
        }
      ]
    })
  })
})
