import { Box } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { frFR } from "@mui/x-data-grid/locales";

export default function DataTable({ rows, columns, getRowId, loading, label }) {
  return (
    <Box sx={{ height: 540, width: "100%", minWidth: 0 }}>
      <DataGrid
        aria-label={label}
        rows={rows}
        columns={columns}
        getRowId={getRowId}
        loading={loading}
        localeText={frFR.components.MuiDataGrid.defaultProps.localeText}
        showToolbar
        ignoreDiacritics
        disableRowSelectionOnClick
        pageSizeOptions={[10, 25, 50, 100]}
        initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
        slotProps={{
          toolbar: {
            csvOptions: { utf8WithBom: true, fileName: label },
            printOptions: { disableToolbarButton: true },
          },
        }}
        sx={{ border: 0, "& .MuiDataGrid-cell": { alignContent: "center" } }}
      />
    </Box>
  );
}
