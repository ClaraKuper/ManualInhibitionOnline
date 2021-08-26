import json
import os
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

import statsmodels.api as sm


# useful functions

def hhmmss_to_sec(duration):
    """
    Takes a time string and converts it to an integer number of seconds

    INPUT:
    Duration: the duration in the format hh:mm:ss

    OUTPUT:
    dur_sec: the duration in seconds
    """

    # split the string
    dur_list = duration.split(':')
    # convert the sting to integers
    dur_int = [int(x) for x in dur_list]

    # create a translate list (hours->sec, minutes->sec, sec->sec)
    translate_list = [3600, 60, 1]

    # compute the seconds per entry and add them all together
    dur_sec = np.sum(np.array(dur_int) * np.array(translate_list))

    return dur_sec


def find_outliers(data, column):
    """
    find indexes where the value is beyond 3x the standard deviation of the mean, return indeces to be removed.

    INPUT:
    data: the data frame
    column: the column where we want to detect outliers
    """

    # compute mean and std
    mean = np.mean(data[column])
    std = np.std(data[column])

    # compute the threshold
    threshold = (3 * std) + mean

    # get indeces to remove
    remove_idx = data[data[column] >= threshold].index

    return remove_idx


def load_missing_data(component, result_id, folder_name='../data/jatos_resultfiles/study-result_{}',
                      file_name='trialData.json'):
    """
    function that tries to load the missing data from result files

    INPUT:
    component: string, the experimental component we want to load ("Trials_Jump" or "Trials_Serial")
    result_id: the ID of the result component (depends on the subject ID)

    OUTPUT:
    df: pd data frame or None
    """

    # get the directory name
    dir_name = folder_name.format(result_id)
    # list all directories there
    subdirs = os.listdir(dir_name)
    for subdir in subdirs:

        # check if the directory includes result files
        if 'comp-result' in subdir:
            # load file
            file = '{}/{}/{}'.format(dir_name, subdir, file_name)
            jo = open(file)
            jl = json.load(jo)
            df = pd.DataFrame(jl)
            # check if the component is what we want it to be
            if np.unique(df.component) == component:
                # return
                return df


def parse_load_data(data, components, meta):
    """
    Function to parse data into several components and load elements that are fully missing from the result files

    INPUT
    data: pd dataframe, the full data frame
    components: list of strings the experimental components we want to parse in individual DFs
    meta: pd dataframe - contains the mapping from subject ID to result IDs

    OUTPUT
    component_list: list of pd dfs, one per component
    """

    df = data.copy()

    # initialize empty component list
    component_list = []
    # load a subject list
    subject_list = np.unique(data.subject)

    # loop through all defined components
    for component in components:

        # filter data from df
        comp_df = df[df.component == component]

        # loop through all subjects
        for subject in subject_list:

            # filter the component df
            sub_df = comp_df[comp_df.subject == subject]

            # check if the subject has not completed any trial in that component
            if len(sub_df) == 0:
                # get the result ID
                resultID = meta[meta['Worker ID'] == int(subject)]['Result ID'].values[0]
                # try to load missing data
                sub_df = load_missing_data(component, resultID)
                # append the loaded df to the full df
                comp_df = pd.concat([comp_df, sub_df], ignore_index=True)
        # fill the component list
        component_list.append(comp_df)

    return component_list


def filter_trials(data, filter_dict):
    """
    Function to filter the relevant parts out of a large data frame

    INPUT:
    data: a pd data frame
    filter_dict: a dictionary containing the name as the column as key and the value that the column should have as value

    OUTPUT:
    df: the filtered data frame
    """
    # make a copy of the data file
    df = data.copy()

    # loop through the entries of the dictionary
    for filter_crit in filter_dict:
        # this is the actual filter
        df = df[df[filter_crit] == filter_dict[filter_crit]]

    # return
    return df


def get_pie_parts(data_series):
    """
    Computes the percentage of responses in each category

    INPUT:
    data_series: a pd series with 1 entry/subject

    OUTPUT:
    parts: a list of the portion of each response
    names: the labels of the responses
    """

    # compute the length of the full series
    full_length = len(data_series)
    # set up an array for the part
    parts = []
    # get the names
    names = np.unique(data_series)

    # loop through all names
    for name in names:
        # append how often this answer was given
        parts.append(sum(data_series == name))
    # divide by the number of total
    parts = np.array(parts) / full_length

    return parts, names


def relate_to_onset(data, cols, startcol):
    """
    Function that align the columns relative to one particular event

    INPUT:
    data: a pandas data frame that holds the relevant columns
    cols: a list of all column names that should be aligned
    startcol: the name of the column that serves as onset value

    OUTPUT
    The aligned data frame, with an extra column "sync" where the start values are saved.

    """

    # save the start column values in the first variable
    data.loc[:]['sync'] = data[startcol]

    # loop through all columns
    for col in cols:

        try:
            # subtract the value of the start column
            data.loc[:][col] = data[col] - data[startcol]

        except TypeError:
            # if the column holds a list, use list comprehension to extract the values
            data.loc[:][col] = [np.array(data[col][x]) - data[startcol][x] for x in data.index]

    return data


def align_to_center(data, cols_to_align, width='windowWidth', height='windowHeight', shift=0):
    data = data.copy()

    xCenter = data[width] / 2
    yCenter = data[height] / 2

    for col in cols_to_align:

        if 'x' in col.lower():
            data.loc[:, col] = (data[col] + shift) - xCenter
        elif 'y' in col.lower():
            data.loc[:, col] = -1 * ((data[col] + shift) - yCenter)
        else:
            print('not sure what this column represented')

    return data


def remove_outliers(data, check_cols, group_by='subject'):
    """
    find all indeces in the dataset that need removal
    INPUT:
    data: the dataset we want to clean
    check_cols: the columns we want to clean
    group_by: computes the threshold for removal based only on data from subgroups in this coumn

    OUTPUT:
    rm_idx: a list with unique indeces that need to be removed from the dataset.
    """

    # create array to store all indeces
    rm_idx = []

    # copy the dataset
    data = data.copy()

    # loop through all groups
    for g in np.unique(data[group_by]):

        # get data from subgroup
        g_data = data[data[group_by] == g]

        # loop through all columns:
        for c in check_cols:
            # detect outliers
            outlier_idx = find_outliers(g_data, c).values
            # add outliers to list
            rm_idx.append(outlier_idx)

    # flatten the nested list
    rm_idx = [item for sublist in rm_idx for item in sublist]

    # return unique values in this list
    return np.unique(rm_idx)


def check_xdot_xtouch_correlation(subjects, data):
    """
    Check if the x-coordinate of the touch response is correlated with the x-coordinate of the dot.
    This function creates plots for every subject and prints an alert if the regression is not significant

    INPUT:
    subjects: array of all subjects
    data: pd dataframe from the jump component with all subjects

    OUTPUT:
    the estimated OLS for all subjects
    """

    # initialize the models
    all_OLS = []

    # get the subjects
    nsubs = len(subjects)

    # always plot 5 columns
    plotcols = 5

    # plot as many rows as needed
    plotrows = int(np.ceil(nsubs / plotcols))

    # plot panels are 3x3
    size_per_panel = 3

    # initialize the plots
    fig_soa_xerror, axs_soa_xerror = plt.subplots(plotrows, plotcols,
                                                  figsize=(size_per_panel * plotcols, size_per_panel * plotrows),
                                                  sharex=True, sharey=True)

    # loop over all subjects
    for s_idx, s in enumerate(subjects):

        # filter the data per subject
        s_df = data[data.subject == s]

        # filter only data where the target jumped
        jump_idx = s_df.stimJumped == 1.0

        # get the absolute values of touch response and dot position - collapse left and right responses
        xTouch = abs(s_df[jump_idx].sTouchX.values)
        xTarget = abs(s_df[jump_idx].jumpedX.values)

        # 1. plot
        axs_soa_xerror.flatten()[s_idx].scatter(xTarget, xTouch, c='steelblue')
        axs_soa_xerror.flatten()[s_idx].set_title(s)
        axs_soa_xerror.flatten()[s_idx].set_xlabel('target x location')
        axs_soa_xerror.flatten()[s_idx].set_ylabel('x response')

        # 2. linear regression
        # add a constant offset to the target
        xTarget_sm = sm.add_constant(xTarget)

        # fit and summarize
        model = sm.OLS(xTouch, xTarget_sm)
        results = model.fit()
        all_OLS.append(results)

        # plot the regression:
        axs_soa_xerror.flatten()[s_idx].plot(xTarget, results.predict(), c='lightblue');

        # check if the slope is positive
        if results.params[1] < 0:
            print(
                "subject {} had a negative correlation between X position of the target and X coordinate of the "
                "response")

        # check if the slope is significant
        if results.pvalues[1] > 0.05:
            print(
                "subject {} had a non-significant correlation between X position of the target and X coordinate of "
                "their response".format(
                    s))

    return all_OLS


def check_touch_target_correlation(subjects, data, X_target_colnames, Y_target_colnames, X_touch_colnames, Y_touch_colnames):
    """
    check if the touch response correlates with the position of the dots on the screen
    prints a plot with the correlation

    INPUT:
    subjects: a list of all subjects that participated
    data: a pd dataframe of the component
    X_target_colnames: all columns with information about the X target location
    Y_target_colnames: all columns with information about the Y target location
    X_touch_colnames: all columns with information about the X touch location
    Y_touch_colnames: all columns with information about the Y touch location

    OUTPUT:
    None
    """

    x_OLS = []
    y_OLS = []

    # get the number of all subjects
    nsubs = len(subjects)
    # always plot 5 columns
    plotcols = 5
    # define the needed number of rows
    plotrows = int(np.ceil(nsubs / plotcols))
    # plot panels have size 3x3
    size_per_panel = 3
    # initialize the figure
    fig_touch_target, axs_touch_target = plt.subplots(plotrows, plotcols,
                                                      figsize=(size_per_panel * plotcols, size_per_panel * plotrows),
                                                      sharex=True, sharey=True)

    # loop through all subjects
    for s_idx, s in enumerate(subjects):

        # filter the dataframe
        sdf = data[data.subject == s].copy()

        # step 1.1.: center the x and y positions around their mean (collaps across all dots)
        sdf.loc[sdf.index, X_target_colnames] -= sdf[X_target_colnames].mean()
        sdf.loc[sdf.index, Y_target_colnames] -= sdf[Y_target_colnames].mean()

        sdf.loc[sdf.index, X_touch_colnames] -= sdf[X_touch_colnames].mean()
        sdf.loc[sdf.index, Y_touch_colnames] -= sdf[Y_touch_colnames].mean()

        # step 2: make a long list of the x positions
        x_targets = pd.concat([sdf[x] for x in X_target_colnames], axis=0, ignore_index=True)
        y_targets = pd.concat([sdf[x] for x in Y_target_colnames], axis=0, ignore_index=True)

        x_touches = pd.concat([sdf[x] for x in X_touch_colnames], axis=0, ignore_index=True)
        y_touches = pd.concat([sdf[x] for x in Y_touch_colnames], axis=0, ignore_index=True)

        # step 3: plot the correlation between x position and x touch
        axs_touch_target.flatten()[s_idx].scatter(x_targets, x_touches, c='grey', alpha=0.2)
        axs_touch_target.flatten()[s_idx].scatter(y_targets, y_touches, c='lightblue', alpha=0.2)
        axs_touch_target.flatten()[s_idx].set_xlabel('target x location')
        axs_touch_target.flatten()[s_idx].set_ylabel('x response')

        # step 4: fit the regression
        # add a constant offset to the target
        xTarget_sm = sm.add_constant(x_targets)
        yTarget_sm = sm.add_constant(y_targets)

        # fit and summarize the x model
        model_x = sm.OLS(x_touches, xTarget_sm)
        results_x = model_x.fit()
        x_OLS.append(results_x)

        # fit and summarize the y model
        model_y = sm.OLS(y_touches, yTarget_sm)
        results_y = model_y.fit()
        y_OLS.append(results_y)

        # plot the regression:
        axs_touch_target.flatten()[s_idx].plot(x_targets, results_x.predict(), c='black', linewidth=3);
        axs_touch_target.flatten()[s_idx].plot(y_targets, results_y.predict(), c='steelblue', linewidth=3);

        # check if the slopes are positive
        if results_x.params[0] < 0 or results_y.params[0] < 0:
            print(
                'subject {} had a negative correlation between the position of the target and the location the response')

        # check if the slope is significant
        if results_x.pvalues[0] > 0.05 or results_y.pvalues[0] > 0.05:
            print('subject {} at a non-significant response slope in at least one direction'.format(s))

    return x_OLS, y_OLS
