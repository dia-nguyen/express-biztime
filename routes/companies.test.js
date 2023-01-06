'use strict'

const db = require("../db");
const request = require("supertest");
const app = require("../app");

let amazonTestCompany1;
let subiTestCompany2;

beforeEach(async () => {
  await db.query("DELETE FROM companies");
  let result = await db.query(`
  INSERT INTO companies
  VALUES ('amazon', 'Amazon', 'Shipper of things'),
         ('subi', 'Subaru', 'Vehicles for the great outdoors');

  INSERT INTO invoices (comp_code, amt, paid, paid_date)
  VALUES ('amazon', 100, FALSE, NULL),
         ('amazon', 200, FALSE, NULL),
         ('amazon', 300, TRUE, '2018-01-01'),
         ('subi', 400, FALSE, NULL);
  `)
  console.log(result.rows)
  amazonTestCompany1 = result.rows[0]
  subiTestCompany2 = result.rows[1]
});


/* GET /companies - returns `{companies: [amazon, ...]}` */
describe("GET /companies", function() {
  test("Gets a list of 2 companies", async () => {
    const resp = await request(app).get("/companies");
    expect(resp.body).toEqual({
      companies: [amazonTestCompany1, subiTestCompany2]
    })
  })
})