import macro                from 'vtk.js/Sources/macro';
import DataAccessHelper     from 'vtk.js/Sources/IO/Core/DataAccessHelper';
import vtkLegacyAsciiParser from 'vtk.js/Sources/IO/Legacy/LegacyAsciiParser';

// ----------------------------------------------------------------------------
// vtkPolyDataReader methods
// ----------------------------------------------------------------------------

function vtkPolyDataReader(publicAPI, model) {
  // Set our className
  model.classHierarchy.push('vtkPolyDataReader');

  // Create default dataAccessHelper if not available
  if (!model.dataAccessHelper) {
    model.dataAccessHelper = DataAccessHelper.get('http');
  }

  // Internal method to fetch Array
  function fetchData(url, option = {}) {
    const compression = model.compression;
    const progressCallback = model.progressCallback;
    return model.dataAccessHelper.fetchText(publicAPI, url, { compression, progressCallback });
  }

  // Set DataSet url
  publicAPI.setUrl = (url, option = {}) => {
    model.url = url;

    // Remove the file in the URL
    const path = url.split('/');
    path.pop();
    model.baseURL = path.join('/');

    model.compression = option.compression;

    // Fetch metadata
    return publicAPI.loadData({ progressCallback: option.progressCallback });
  };

  // Fetch the actual data arrays
  publicAPI.loadData = (option = {}) => {
    const promise = fetchData(model.url, option);
    promise.then(publicAPI.parse);
    return promise;
  };

  publicAPI.parse = (content) => {
    if (!content) {
      return;
    }
    if (content !== model.parseData) {
      publicAPI.modified();
    } else {
      return;
    }

    model.parseData = content;
    model.output[0] = vtkLegacyAsciiParser.parseLegacyASCII(model.parseData).dataset;
  };

  publicAPI.requestData = (inData, outData) => {
    publicAPI.parse(model.parseData);
  };
}

// ----------------------------------------------------------------------------
// Object factory
// ----------------------------------------------------------------------------

const DEFAULT_VALUES = {
  // baseURL: null,
  // dataAccessHelper: null,
  // url: null,
};

// ----------------------------------------------------------------------------


export function extend(publicAPI, model, initialValues = {}) {
  Object.assign(model, DEFAULT_VALUES, initialValues);

  // Build VTK API
  macro.obj(publicAPI, model);
  macro.get(publicAPI, model, [
    'url',
    'baseURL',
  ]);
  macro.setGet(publicAPI, model, [
    'dataAccessHelper',
  ]);
  macro.algo(publicAPI, model, 0, 1);

  // vtkPolyDataReader methods
  vtkPolyDataReader(publicAPI, model);
}

// ----------------------------------------------------------------------------

export const newInstance = macro.newInstance(extend, 'vtkPolyDataReader');

// ----------------------------------------------------------------------------

export default { newInstance, extend };
