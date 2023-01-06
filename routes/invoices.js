"use strict";

const express = require("express");
const db = require("../db");

const { NotFoundError, BadRequestError } = require("../expressError");

const router = new express.Router();

/**
 * GET /invoices
 * Return info on invoices: like {invoices: [{id, comp_code}, ...]}
 */
router.get("/", async function (req, res, next) {
  const results = await db.query(
    `SELECT id, comp_code
      FROM invoices`
  );
  const invoices = results.rows;

  return res.json({ invoices });
});

/**
 * GET /invoices/[id]
 * Returns obj on given invoice.
 * If invoice cannot be found, returns 404.
 * Returns {invoice: {id, amt, paid, add_date, paid_date, company: {code, name, description}}
 */
router.get("/:id", async function (req, res, next) {
  const iResults = await db.query(
    `SELECT id, amt, paid, add_date, paid_date, comp_code
        FROM invoices
        JOIN companies ON (invoices.comp_code = companies.code)
        WHERE id = $1`,
    [req.params.id]
  );
  const invoice = iResults.rows[0];

  if (!invoice) throw new NotFoundError();

  const cResults = await db.query(
    `SELECT code, name, description
    FROM companies
    WHERE code = $1`,
    [invoice.comp_code]
  );

  const company = cResults.rows[0];

  delete invoice.comp_code;
  // invoice.comp_code = undefined;
  invoice.company = company;
  return res.json({ invoice });
});

/* POST /invoices
Adds an invoice.
Needs to be passed in JSON body of: {comp_code, amt}
Returns: {invoice: {id, comp_code, amt, paid, add_date, paid_date}}
 */
router.post("/", async function (req, res, next) {
  if (req.body === undefined) throw new BadRequestError();

  const { comp_code, amt } = req.body;
  const results = await db.query(
    `INSERT INTO invoices(comp_code, amt)
      VALUES ($1, $2)
      RETURNING id, comp_code, amt, paid, add_date, paid_date`,
    [comp_code, amt]
  );

  const invoice = results.rows[0];
  return res.status(201).json({ invoice });
});

/* PUT /invoices/[id]
Updates an invoice.
If invoice cannot be found, returns a 404.
Needs to be passed in a JSON body of {amt}
Returns: {invoice: {id, comp_code, amt, paid, add_date, paid_date}} */

router.put("/:id", async function (req, res, next) {
  if (req.body === undefined) throw new BadRequestError();
  const { amt } = req.body;

  const result = await db.query(
    `UPDATE invoices
      SET amt = $1
      WHERE id = $2
      RETURNING id, comp_code, amt, paid, add_date, paid_date`,
    [amt, req.params.id]
  );

  const invoice = result.rows[0];

  if (!invoice) throw new NotFoundError(`Invoice ${req.params.id} not found`);
  return res.json({ invoice });
});

/**
 * DELETE /companies/[code]
 * Deletes company.
 * Should return 404 if company cannot be found.
 * Returns {status: "deleted"}
 */
router.delete("/:id", async function (req, res, next) {
  const result = await db.query(
    `DELETE FROM invoices
      WHERE id = $1
      RETURNING id`,
    [req.params.id]
  );

  const invoice = result.rows[0];

  if (!invoice) throw new NotFoundError(`Invoice ${req.params.id} not found`);

  return res.json({
    status: "deleted",
  });
});

module.exports = router;
