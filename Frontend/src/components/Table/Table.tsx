import { Component } from "react";
import "./Table.css"

export class Table extends Component {
    render() {
        return (
            <div>
            <h1 className="text-2xl m-5">الفواتير</h1>
                <table>
                    <thead >
                        <th>الفاتوره</th>
                        <th>التاريخ</th>
                        <th>الحالة</th>
                        <th>القيمة</th>
                    </thead>
                    <tbody>
                        <tr>
                            <td>#00001</td>
                            <td>02/11/2026</td>
                            <td>تم الدفع</td>
                            <td>1961</td>
                        </tr>
                        <tr>
                            <td>#00002</td>
                            <td>02/11/2026</td>
                            <td>تم الدفع</td>
                            <td>1972</td>
                        </tr>
                        <tr>
                            <td>#00003</td>
                            <td>02/11/2026</td>
                            <td>تم الدفع</td>
                            <td>1975</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }

}

export default Table;