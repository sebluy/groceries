import * as React from 'react'
import { useTable, useSortBy } from 'react-table'

export function ReactTable({data, columns, hasFooter=false}) {

    const { getTableProps, getTableBodyProps, headerGroups, footerGroups, rows, prepareRow } =
        useTable({data, columns}, useSortBy)

    return (
        <table {...getTableProps()}>
            <thead>
                {headerGroups.map(headerGroup => (
                    <tr {...headerGroup.getHeaderGroupProps()}>
                        {headerGroup.headers.map((column: any) => (
                            <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                                {column.render('Header')}
                                <span>
                                    {column.isSorted ? (column.isSortedDesc ? ' (Desc)' : ' (Asc)') : ''}
                                </span>
                            </th>
                            ))}
                    </tr>
                ))}
            </thead>
            <tbody {...getTableBodyProps()}>
                {rows.map((row, i) => {
                    prepareRow(row);
                    return (
                        <tr {...row.getRowProps()}>
                            {row.cells.map(cell => {
                                return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                            })}
                        </tr>
                )})}
            </tbody>
            {hasFooter && (
                <tfoot>
                    {footerGroups.map(group => (
                        <tr {...group.getFooterGroupProps()}>
                            {group.headers.map(column => (
                                <td {...column.getFooterProps()}>{column.render('Footer')}</td>
                            ))}
                        </tr>
                    ))}
                </tfoot>
            )}
        </table>
    )
}
