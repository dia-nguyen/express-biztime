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
    // `SELECT id, amt, paid, add_date, paid_date, comp_code
    // FROM invoices
    // WHERE id = $1`, [id]`
  const iResults = await db.query(
      `SELECT id, amt, paid, add_date, paid_date
        FROM invoices
        JOIN companies ON (invoices.comp_code = companies.code)
        WHERE id = $1`, [id]
  );
  const invoice = iResults.rows[0];

  const cResults = await db.query(
    `SELECT code, name, description
      FROM companies
      WHERE code = $1`, [code]
  );

});
module.exports = router;
