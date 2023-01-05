"use strict";

const express = require("express");
const db = require("../db");

const { NotFoundError, BadRequestError } = require("../expressError");

const router = new express.Router();

/**
 * GET /companies
 * Returns list of companies, like {companies: [{code, name}, ...]}
 */
router.get("/", async function (req, res, next) {
  const results = await db.query(
    `SELECT code, name
      FROM companies
      ORDER BY name`
  );

  const companies = results.rows;

  return res.json({ companies });
});

/**
 * GET /companies/[code]
 * Return obj of company: {company: {code, name, description}}
 * If the company given cannot be found, this should return a 404 status response.
 */
router.get("/:code", async function (req, res, next) {
  const code = req.params.code;

  const results = await db.query(
    `SELECT code, name, description
      FROM companies
      WHERE code = $1`,
    [code]
  );

  const company = results.rows[0];

  if (!company) throw new NotFoundError();

  return res.json({ company });
});

/**
 * POST /companies
 * Adds a company.Needs to be given JSON like: {code, name, description}
 * Returns obj of new company: {company: {code, name, description}}
 */
router.post("/", async function (req, res, next) {
  if (req.body === undefined) throw new BadRequestError();
  //test if keys in body = 0
  //write middleware that tests if keys exist then throw error

  const { code, name, description } = req.body;

  const results = await db.query(
    `INSERT INTO companies(code,name,description)
      VALUES ($1, $2, $3)
      RETURNING code, name, description`,
    [code, name, description]
  );

  const company = results.rows[0];
  return res.status(201).json({ company });
});

/*
* PUT /companies/[code]
* Edit existing company.
* Should return 404 if company cannot be found.
* Needs to be given JSON like: {name, description}
* Returns update company object: {company: {code, name, description}}
*/

router.put("/:code", async function (req, res, next) {
  //TODO: req.body is returning {} instead of undefined?
  if (req.body === undefined) throw new BadRequestError();

  const { name, description } = req.body;

  const result = await db.query(
    `UPDATE companies
      SET name = $1,
        description = $2
      WHERE code = $3
      RETURNING code, name, description`,
    [name, description, req.params.code]
  );
  const company = result.rows[0];

  if (!company) throw new NotFoundError(`${req.params.code} not found`);

  return res.json({ company });
});


/**
 * DELETE /companies/[code]
 * Deletes company.
 * Should return 404 if company cannot be found.
 * Returns {status: "deleted"}
 */
router.delete("/:code", async function (req, res, next) {
  const result = await db.query(
    `DELETE FROM companies
      WHERE code = $1
      RETURNING code`
      , [req.params.code]
  )

  const company = result.rows[0];

  if (!company) throw new NotFoundError(`${req.params.code} not found`);

  return res.json({
    status: "deleted"
  })
})


module.exports = router;
