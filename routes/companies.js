"use strict";

const express = require("express");
const router = new express.Router();
const db = require("../db")

const { NotFoundError, BadRequestError } = require("../expressError")
console.log(NotFoundError)
/**
 * GET /companies
 * Returns list of companies, like {companies: [{code, name}, ...]}
 */
router.get("/", async function(req, res, next){
  //TODO:why is next in the example?

  throw new NotFoundError();
  const results = await db.query(
    `SELECT code, name
      FROM companies`);

  console.log('results',results);
  const companies = results.rows;
  res.json({ companies });
})

/**
 * GET /companies/[code]
 * Return obj of company: {company: {code, name, description}}
 * If the company given cannot be found, this should return a 404 status response.
 */
router.get("/:code", async function(req, res, next){
  console.log(`*** making GET request: req.body: ${req.body} \n res.params: ${res.params}` )
  const code = req.params.code;

  const results = await db.query(
    `SELECT code, name, description
      FROM companies
      WHERE code = $1`, [code]
  );

  const company = results.rows[0];

  if (!company) throw new NotFoundError();

  res.json({ company });
})

/**
 * POST /companies
 * Adds a company.Needs to be given JSON like: {code, name, description}
 * Returns obj of new company: {company: {code, name, description}}
 */
router.post("/", async function(req, res, next){
  if (req.body === undefined) throw new BadRequestError();

  const { code, name, description } = req.body;

  const results = await db.query(
    `INSERT INTO companies(code,name,description)
      VALUES ($1, $2, $3)
      RETURNING code, name, description`, [code, name, description]
  )

  const company = results.rows[0];
  res.status(201).json({ company });
})

/*
PUT /companies/[code]
Edit existing company.
Should return 404 if company cannot be found.
Needs to be given JSON like: {name, description}
Returns update company object: {company: {code, name, description}} */

router.put("/:code", async function(req, res, next) {
  if(req.body === undefined) throw new BadRequestError();
  const { name, description } = req.body;

  const result = await db.query(
    `UPDATE companies
      SET name = $1,
        description = $2
      WHERE code = $3
      RETURNING code, name, description`,
      [req.params.code, name, description]
  );
  const company = result.rows[0];

  if (!company) throw new NotFoundError();

  return res.json({ company })
})





module.exports = router;