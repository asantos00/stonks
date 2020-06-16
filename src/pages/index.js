import React, { useState } from "react"
import { Link, graphql } from "gatsby"

import Layout from "../components/layout"
import Image from "../components/image"
import SEO from "../components/seo"

const COLORS_BY_GROUP = {
  TECH: "green",
  GOODS: "red",
  CRYPTO: "blue",
  SPAIN: "yellow",
  AVIATION: "orange",
  GERMANY: "black",
}

const GroupTag = ({ group = "" }) => {
  return (
    <div
      style={{
        padding: "2px 8px",
        borderRadius: "3px",
        color: "white",
        backgroundColor: COLORS_BY_GROUP[group] || "grey",
        fontSize: 10,
        marginRight: "auto",
      }}
    >
      {group.toUpperCase()}
    </div>
  )
}

const FilterInput = ({ onKeyDown, value = "" }) => {
  return (
    <React.Fragment>
      <label for="filter-by" style={{ marginRight: 16 }}>
        Filter by:
      </label>
      <input
        id="filter-by"
        type="text"
        value={value}
        onChange={e => {
          onKeyDown(e.target.value)
        }}
      />
      <div style={{ fontSize: 10 }}>
        Try out filters like "bull", "amd" or "tech"
      </div>
    </React.Fragment>
  )
}

const StockCard = ({ stock }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      flexWrap: "wrap",
      boxShadow: "0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)",
      marginBottom: 16,
      padding: 8,
      overflow: "hidden",
      borderRadius: 3,
    }}
  >
    <GroupTag group={stock.group} />
    <h3 style={{ paddingTop: 16 }}>
      <a
        href={stock.url}
        style={{ textDecoration: "none", color: "#111" }}
        target="_blank"
      >
        {stock.stock}
      </a>
    </h3>
    <h4>
      {stock.today}$ ({stock.drop})
    </h4>
    <h5>
      Price earnings:{" "}
      <span
        style={{
          color: stock.trend && stock.trend.includes("Bull") ? "green" : "red",
        }}
      >
        {stock.p_e__priceEarnings_}
      </span>
    </h5>
    <h5>
      Strategy:{" "}
      {stock.strategy && stock.strategy.includes("Pessimistic") ? "👎" : "👍"}
    </h5>
  </div>
)

const StockRow = ({ stock }) => {
  const [isHover, setIsHover] = useState(false)

  return (
    <tr
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      style={{
        backgroundColor: isHover ? "#ddd" : "transparent",
      }}
    >
      <td
        style={{
          minWidth: 110,
        }}
      >
        <a href={stock.url} target="_blank">
          {stock.stock}
        </a>
      </td>
      <td>
        {stock.today}$ ({stock.drop})
      </td>
      <td>
        <span
          style={{
            color:
              stock.trend && stock.trend.includes("Bull") ? "green" : "red",
          }}
        >
          {stock.p_e__priceEarnings_}
        </span>
      </td>
      <td>
        {stock.strategy && stock.strategy.includes("Pessimistic") ? "👎" : "👍"}
      </td>
    </tr>
  )
}

const VISUALISATION_MODE = {
  CARDS: "cards",
  LIST: "list",
}

const IndexPage = ({ data }) => {
  const [filterBy, setFilterBy] = useState("")
  const [visualisationMode, setVisualisationMode] = useState(
    VISUALISATION_MODE.CARDS
  )
  const filteredStocks = data.allGoogleSpreadsheetStonks2020Stonks.nodes.filter(
    node => {
      return (
        (node.stock &&
          node.stock.toLowerCase().includes(filterBy.toLowerCase())) ||
        (node.trend &&
          node.trend.toLowerCase().includes(filterBy.toLowerCase())) ||
        (node.group &&
          node.group.toLowerCase().includes(filterBy.toLowerCase()))
      )
    }
  )

  return (
    <Layout>
      <SEO title="Stonks - Overview" />
      <main>
        <div style={{ padding: 16 }}>
          <FilterInput
            value={filterBy}
            onKeyDown={value => setFilterBy(value)}
          />
          <button
            style={{
              marginBottom: 16,
            }}
            onClick={() =>
              setVisualisationMode(
                visualisationMode === VISUALISATION_MODE.CARDS
                  ? VISUALISATION_MODE.LIST
                  : VISUALISATION_MODE.CARDS
              )
            }
          >
            Change visualisation
          </button>
        </div>
        {visualisationMode === VISUALISATION_MODE.LIST ? (
          <table style={{ width: "100%" }}>
            <thead style={{ backgroundColor: "#AAA" }}>
              <td>Stock</td>
              <td>Price (Drop)</td>
              <td>Price earnings</td>
              <td>Strategy</td>
            </thead>
            {filteredStocks.map(node => (
              <StockRow stock={node} />
            ))}
          </table>
        ) : (
          filteredStocks.map(node => <StockCard stock={node} />)
        )}
      </main>
    </Layout>
  )
}

export const query = graphql`
  query OverviewQuery {
    allGoogleSpreadsheetStonks2020Stonks {
      nodes {
        buy
        chart
        stock
        today
        tp__takeProfit_
        trend
        url
        author
        p_e__priceEarnings_
        strategy
        drop
        group
      }
    }
  }
`

export default IndexPage
