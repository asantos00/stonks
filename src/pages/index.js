import "regenerator-runtime/runtime.js"

import React, { useState } from "react"
import { Link, graphql } from "gatsby"

import Layout from "../components/layout"
import Image from "../components/image"
import SEO from "../components/seo"
import {
  useTable,
  useSortBy,
  useGlobalFilter,
  useAsyncDebounce,
} from "react-table"

const COLORS_BY_GROUP = {
  TECH: "green",
  GOODS: "red",
  CRYPTO: "blue",
  SPAIN: "yellow",
  AVIATION: "orange",
  GERMANY: "black",
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
          color:
            parseInt(stock.p_e__priceEarnings_, 10) < 15
              ? "green"
              : parseInt(stock.p_e__priceEarnings_, 10) > 30
              ? "red"
              : "grey",
        }}
      >
        {parseInt(stock.p_e__priceEarnings_, 10) < 15}
        {stock.p_e__priceEarnings_}
      </span>
    </h5>
    <h5>
      Strategy:{" "}
      {stock.strategy && stock.strategy.includes("Pessimistic") ? "👎" : "👍"}
    </h5>
  </div>
)

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

const FilterInput = ({
  preGlobalFilteredRows,
  globalFilter,
  setGlobalFilter,
}) => {
  const [value, setValue] = React.useState(globalFilter)
  const onChange = useAsyncDebounce(value => {
    setGlobalFilter(value || undefined)
  }, 200)
  return (
    <div style={{ marginLeft: 16 }}>
      <label htmlFor="filter-by" style={{ marginRight: 16 }}>
        Full-text search
      </label>
      <input
        id="filter-by"
        type="text"
        value={value || ""}
        onChange={e => {
          setValue(e.target.value)
          onChange(e.target.value)
        }}
      />
      <div style={{ fontSize: 10 }}>
        Try out filters like "tsla", "tech", "bull"
      </div>
    </div>
  )
}

const VISUALISATION_MODE = {
  CARDS: "cards",
  LIST: "list",
}

const columns = [
  {
    Header: "Stock",
    accessor: "stock",
    Cell: ({ row }) => {
      console.log(row.values)
      return (
        <a
          href={row.values.url}
          target="_blank"
          rel="noopener"
          style={{ textDecoration: "none" }}
        >
          {row.values.stock}
        </a>
      )
    },
  },
  {
    Header: "Current price",
    accessor: "today",
  },
  {
    Header: "Drop to buy",
    accessor: "drop",
  },
  {
    Header: "Buy",
    accessor: "buy",
  },
  {
    Header: "Take profit",
    accessor: "tp__takeProfit_",
  },
  {
    Header: "Potential",
    accessor: "potential",
    Cell: ({ value }) => (
      <span
        style={{
          color:
            parseInt(value, 10) > 40
              ? "green"
              : parseInt(value, 10) < 20
              ? "red"
              : "grey",
        }}
      >
        {value}
      </span>
    ),
  },
  {
    Header: "Price earnings",
    accessor: "p_e__priceEarnings_",
    Cell: ({ row }) => {
      const isNA = row.values.p_e__priceEarnings_ === "N/A"
      const textColor = isNA
        ? "grey"
        : parseInt(row.values.p_e__priceEarnings_, 10) < 15
        ? "green"
        : parseInt(row.values.p_e__priceEarnings_, 10) > 30
        ? "red"
        : "grey"

      return (
        <span style={{ color: textColor }}>
          {row.values.p_e__priceEarnings_ || "N/A"}
        </span>
      )
    },
  },
  {
    Header: "Strategy",
    accessor: "strategy",
    Cell: ({ value }) => {
      return value === "Pessimistic" ? "👎" : "👍"
    },
  },
  {
    Header: "Author",
    accessor: row => ["fs", "pm", "nr", "as"].filter(key => row[key]),
  },
  // Hidden
  {
    Header: "Trend",
    accessor: "trend",
  },
  {
    Header: "Group",
    accessor: "group",
  },
  {
    Header: "URL",
    accessor: "url",
  },
]

const StockTable = ({ data, columns }) => {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    preGlobalFilteredRows,
    setGlobalFilter,
    state,
  } = useTable(
    {
      columns,
      data: data,
      initialState: {
        hiddenColumns: ["trend", "group", "url"],
      },
    },
    useGlobalFilter,
    useSortBy
  )
  return (
    <React.Fragment>
      <FilterInput
        preGlobalFilteredRows={preGlobalFilteredRows}
        setGlobalFilter={setGlobalFilter}
        globalFilter={state.globalFilter}
      />
      <table {...getTableProps()}>
        <thead>
          {headerGroups.map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                  {column.render("Header")}
                  <span>
                    {column.isSorted
                      ? column.isSortedDesc
                        ? " 🔽"
                        : " 🔼"
                      : ""}
                  </span>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map(row => {
            prepareRow(row)
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map(cell => (
                  <td {...cell.getCellProps()}>{cell.render("Cell")}</td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </React.Fragment>
  )
}
const IndexPage = ({ data }) => {
  const [filterBy, setFilterBy] = useState("")

  return (
    <Layout>
      <SEO title="Stonks - Overview" />
      <main>
        <StockTable
          data={data.allGoogleSpreadsheetStonks2020Stonks.nodes}
          columns={columns}
        />
      </main>
    </Layout>
  )
}

export const query = graphql`
  query OverviewQuery {
    allGoogleSpreadsheetStonks2020Stonks {
      nodes {
        url
        buy
        chart
        stock
        today
        tp__takeProfit_
        trend
        p_e__priceEarnings_
        potential
        strategy
        drop
        group
        as
        pm
        nr
        fs
      }
    }
  }
`

export default IndexPage
